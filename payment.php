
<?php

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "../database.php";

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized. Please login first."
    ]);
    exit;
}

$user_id = (int) $_SESSION["user_id"];
$user_role = strtolower(trim($_SESSION["role"] ?? ""));

// =====================================================
// HELPER - GET THE CORRECT CUSTOMER NAME
// =====================================================

function getCustomerName($order) {
    $user_name = trim($order["user_full_name"] ?? "");
    $order_name = trim($order["customer_name"] ?? "");

    if ($user_name !== "") {
        return $user_name;
    }

    if ($order_name !== "") {
        return $order_name;
    }

    return "Unknown Customer";
}

// =====================================================
// POST - CUSTOMER SUBMITS PROOF OF PAYMENT
// =====================================================

if (
    $_SERVER["REQUEST_METHOD"] === "POST" &&
    ($_POST["action"] ?? "") === "submit_proof"
) {
    if (
        !isset($_FILES["proof_of_payment"]) ||
        $_FILES["proof_of_payment"]["error"] !== UPLOAD_ERR_OK
    ) {
        $upload_error = $_FILES["proof_of_payment"]["error"] ?? "No file selected";

        echo json_encode([
            "success" => false,
            "message" => "Please select a valid proof-of-payment file.",
            "upload_error" => $upload_error
        ]);
        exit;
    }

    $order_number = trim($_POST["order_number"] ?? "");
    $amount_paid = filter_var(
        $_POST["amount"] ?? null,
        FILTER_VALIDATE_FLOAT
    );
    $payment_method = trim($_POST["payment_method"] ?? "");

    $allowed_methods = [
        "Cash",
        "GCash",
        "Bank Transfer",
        "Other"
    ];

    if (
        $order_number === "" ||
        $amount_paid === false ||
        $amount_paid <= 0
    ) {
        echo json_encode([
            "success" => false,
            "message" => "Please enter a valid order number and amount."
        ]);
        exit;
    }

    if (!in_array($payment_method, $allowed_methods, true)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid payment method."
        ]);
        exit;
    }

    $file = $_FILES["proof_of_payment"];

    if ($file["size"] <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "The selected file is empty."
        ]);
        exit;
    }

    if ($file["size"] > 5 * 1024 * 1024) {
        echo json_encode([
            "success" => false,
            "message" => "The file must not exceed 5 MB."
        ]);
        exit;
    }

    if (!class_exists("finfo")) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "PHP fileinfo is not enabled. Please enable it in php.ini."
        ]);
        exit;
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file["tmp_name"]);

    $allowed_types = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/webp" => "webp",
        "application/pdf" => "pdf",
        "application/x-pdf" => "pdf"
    ];

    if ($mime === false || !isset($allowed_types[$mime])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid file type. Please upload a valid JPG, PNG, WEBP, or PDF file.",
            "detected_type" => $mime,
            "original_filename" => $file["name"]
        ]);
        exit;
    }

    $order_stmt = $conn->prepare("
        SELECT order_id, order_number, total_amount
        FROM orders
        WHERE order_number = ? AND customer_id = ?
        LIMIT 1
    ");

    if (!$order_stmt) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Could not prepare the order query."
        ]);
        exit;
    }

    $order_stmt->bind_param("si", $order_number, $user_id);
    $order_stmt->execute();
    $order_result = $order_stmt->get_result();

    if ($order_result->num_rows === 0) {
        $order_stmt->close();

        echo json_encode([
            "success" => false,
            "message" => "Order not found, or it does not belong to your account."
        ]);
        exit;
    }

    $order = $order_result->fetch_assoc();
    $order_stmt->close();

    $order_id = (int) $order["order_id"];
    $total_amount = (float) $order["total_amount"];

    if ((float) $amount_paid < $total_amount) {
        echo json_encode([
            "success" => false,
            "message" => "The amount must be at least ₱" .
                number_format($total_amount, 2) . "."
        ]);
        exit;
    }

    $check_stmt = $conn->prepare("
        SELECT payment_id
        FROM payments
        WHERE order_id = ?
        LIMIT 1
    ");

    if (!$check_stmt) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Could not check the existing payment record."
        ]);
        exit;
    }

    $check_stmt->bind_param("i", $order_id);
    $check_stmt->execute();

    $already_exists = $check_stmt->get_result()->num_rows > 0;
    $check_stmt->close();

    if ($already_exists) {
        echo json_encode([
            "success" => false,
            "message" => "A payment record already exists for this order. Please contact the admin."
        ]);
        exit;
    }

    $upload_dir = dirname(__DIR__) . "/uploads/payment_proofs/";

    if (
        !is_dir($upload_dir) &&
        !mkdir($upload_dir, 0755, true) &&
        !is_dir($upload_dir)
    ) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Could not create the upload folder."
        ]);
        exit;
    }

    $filename = bin2hex(random_bytes(16)) . "." . $allowed_types[$mime];
    $destination = $upload_dir . $filename;
    $relative_path = "uploads/payment_proofs/" . $filename;

    if (!move_uploaded_file($file["tmp_name"], $destination)) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Could not save the uploaded proof. Check folder permissions."
        ]);
        exit;
    }

    $payment_status = "Pending";
    $change_amount = 0.00;

    $insert_stmt = $conn->prepare("
        INSERT INTO payments (
            order_id,
            amount_paid,
            change_amount,
            payment_status,
            payment_method,
            proof_of_payment
        )
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    if (!$insert_stmt) {
        @unlink($destination);

        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Could not prepare the payment record."
        ]);
        exit;
    }

    $insert_stmt->bind_param(
        "iddsss",
        $order_id,
        $amount_paid,
        $change_amount,
        $payment_status,
        $payment_method,
        $relative_path
    );

    if (!$insert_stmt->execute()) {
        @unlink($destination);
        $insert_stmt->close();

        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Could not save the payment record."
        ]);
        exit;
    }

    $payment_id = (int) $conn->insert_id;
    $insert_stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Proof of payment uploaded. Please wait for admin verification.",
        "payment_id" => $payment_id,
        "order_number" => $order_number,
        "payment_status" => "Pending",
        "proof_of_payment" => $relative_path
    ]);

    $conn->close();
    exit;
}

// =====================================================
// GET - PAYMENT RECORDS AND UNPAID ORDERS
// =====================================================

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $stmt = $conn->prepare("
        SELECT
            p.payment_id,
            p.order_id,
            p.amount_paid,
            p.change_amount,
            p.payment_status,
            p.payment_method,
            p.payment_date,
            p.proof_of_payment,
            o.order_number,
            o.customer_name,
            u.full_name AS user_full_name,
            o.total_amount
        FROM payments p
        INNER JOIN orders o ON p.order_id = o.order_id
        LEFT JOIN users u ON o.customer_id = u.user_id
        ORDER BY p.payment_id DESC
    ");

    if (!$stmt) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to load payment records."
        ]);
        exit;
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $payments = [];

    while ($row = $result->fetch_assoc()) {
        $payments[] = [
            "payment_id" => (int) $row["payment_id"],
            "order_id" => (int) $row["order_id"],
            "order_number" => $row["order_number"],
            "customer_name" => getCustomerName($row),
            "total_amount" => (float) $row["total_amount"],
            "amount_paid" => (float) $row["amount_paid"],
            "change_amount" => (float) $row["change_amount"],
            "payment_status" => $row["payment_status"],
            "payment_method" => $row["payment_method"],
            "payment_date" => $row["payment_date"],
            "proof_of_payment" => $row["proof_of_payment"]
        ];
    }

    $stmt->close();

    $orders_stmt = $conn->prepare("
        SELECT
            o.order_id,
            o.order_number,
            o.customer_name,
            u.full_name AS user_full_name,
            o.total_amount
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.user_id
        LEFT JOIN payments p ON o.order_id = p.order_id
        WHERE p.payment_id IS NULL
        ORDER BY o.order_id DESC
    ");

    $orders = [];

    if ($orders_stmt) {
        $orders_stmt->execute();
        $orders_result = $orders_stmt->get_result();

        while ($row = $orders_result->fetch_assoc()) {
            $orders[] = [
                "order_id" => (int) $row["order_id"],
                "order_number" => $row["order_number"],
                "customer_name" => getCustomerName($row),
                "total_amount" => (float) $row["total_amount"]
            ];
        }

        $orders_stmt->close();
    }

    $stats_result = $conn->query("
        SELECT
            COUNT(*) AS total_transactions,
            COALESCE(
                SUM(
                    CASE
                        WHEN payment_status = 'Paid' THEN amount_paid
                        ELSE 0
                    END
                ),
                0
            ) AS total_paid
        FROM payments
    ");

    $statistics = [
        "total_transactions" => 0,
        "total_paid" => 0
    ];

    if ($stats_result) {
        $stats = $stats_result->fetch_assoc();

        $statistics = [
            "total_transactions" => (int) $stats["total_transactions"],
            "total_paid" => (float) $stats["total_paid"]
        ];
    }

    echo json_encode([
        "success" => true,
        "payments" => $payments,
        "orders" => $orders,
        "statistics" => $statistics
    ]);

    $conn->close();
    exit;
}

// =====================================================
// POST - ADMIN UPDATES PAYMENT STATUS
// =====================================================

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $raw_input = file_get_contents("php://input");
    $data = json_decode($raw_input, true);

    if (!is_array($data)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON request."
        ]);
        exit;
    }

    if (($data["action"] ?? "") === "update_status") {
        if ($user_role !== "admin") {
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "message" => "Only the admin can update payment status."
            ]);
            exit;
        }

        $payment_id = (int) ($data["payment_id"] ?? 0);
        $payment_status = trim($data["payment_status"] ?? "");

        if ($payment_id <= 0) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid payment ID."
            ]);
            exit;
        }

        if (!in_array($payment_status, ["Pending", "Paid"], true)) {
            echo json_encode([
                "success" => false,
                "message" => "Payment status must be Pending or Paid."
            ]);
            exit;
        }

        $update_stmt = $conn->prepare("
            UPDATE payments
            SET payment_status = ?
            WHERE payment_id = ?
            LIMIT 1
        ");

        if (!$update_stmt) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Could not prepare payment status update."
            ]);
            exit;
        }

        $update_stmt->bind_param("si", $payment_status, $payment_id);

        if (!$update_stmt->execute()) {
            $update_stmt->close();
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Could not update payment status."
            ]);
            exit;
        }

        $update_stmt->close();

        $verify_stmt = $conn->prepare("
            SELECT payment_id, payment_status
            FROM payments
            WHERE payment_id = ?
            LIMIT 1
        ");

        if (!$verify_stmt) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Could not verify payment status."
            ]);
            exit;
        }

        $verify_stmt->bind_param("i", $payment_id);
        $verify_stmt->execute();
        $verify_result = $verify_stmt->get_result();

        if ($verify_result->num_rows === 0) {
            $verify_stmt->close();
            echo json_encode([
                "success" => false,
                "message" => "Payment record not found."
            ]);
            exit;
        }

        $verified_payment = $verify_result->fetch_assoc();
        $verify_stmt->close();

        echo json_encode([
            "success" => true,
            "message" => "Payment status updated successfully.",
            "payment_id" => (int) $verified_payment["payment_id"],
            "payment_status" => $verified_payment["payment_status"]
        ]);

        $conn->close();
        exit;
    }

    // =====================================================
    // ADMIN RECORDS A CASH OR OTHER PAYMENT
    // =====================================================

    if ($user_role !== "admin") {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Only the admin can record a payment."
        ]);
        exit;
    }

    $order_id = (int) ($data["order_id"] ?? 0);
    $amount_paid = (float) ($data["amount"] ?? 0);
    $payment_method = trim($data["payment_method"] ?? "Cash");

    if ($order_id <= 0 || $amount_paid <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Please enter a valid order and payment amount."
        ]);
        exit;
    }

    $allowed_methods = [
        "Cash",
        "GCash",
        "Bank Transfer",
        "Other"
    ];

    if (!in_array($payment_method, $allowed_methods, true)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid payment method."
        ]);
        exit;
    }

    $stmt = $conn->prepare("
        SELECT
            o.order_id,
            o.order_number,
            o.customer_name,
            u.full_name AS user_full_name,
            o.total_amount
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.user_id
        WHERE o.order_id = ?
        LIMIT 1
    ");

    if (!$stmt) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Could not prepare the order query."
        ]);
        exit;
    }

    $stmt->bind_param("i", $order_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();

        echo json_encode([
            "success" => false,
            "message" => "Order not found."
        ]);
        exit;
    }

    $order = $result->fetch_assoc();
    $stmt->close();

    $total_amount = (float) $order["total_amount"];

    if ($amount_paid < $total_amount) {
        echo json_encode([
            "success" => false,
            "message" => "Payment is not enough. Total amount is ₱" .
                number_format($total_amount, 2)
        ]);
        exit;
    }

    $check = $conn->prepare("
        SELECT payment_id
        FROM payments
        WHERE order_id = ?
        LIMIT 1
    ");

    if (!$check) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Could not check the existing payment record."
        ]);
        exit;
    }

    $check->bind_param("i", $order_id);
    $check->execute();
    $exists = $check->get_result()->num_rows > 0;
    $check->close();

    if ($exists) {
        echo json_encode([
            "success" => false,
            "message" => "A payment record already exists for this order."
        ]);
        exit;
    }

    $change_amount = $amount_paid - $total_amount;
    $payment_status = "Paid";

    $conn->begin_transaction();

    try {
        $insert = $conn->prepare("
            INSERT INTO payments (
                order_id,
                amount_paid,
                change_amount,
                payment_status,
                payment_method
            )
            VALUES (?, ?, ?, ?, ?)
        ");

        if (!$insert) {
            throw new Exception("Could not prepare payment record.");
        }

        $insert->bind_param(
            "iddss",
            $order_id,
            $amount_paid,
            $change_amount,
            $payment_status,
            $payment_method
        );

        if (!$insert->execute()) {
            throw new Exception("Could not save payment record.");
        }

        $payment_id = (int) $conn->insert_id;
        $insert->close();

        $update = $conn->prepare("
            UPDATE orders
            SET status = 'Completed'
            WHERE order_id = ?
        ");

        if (!$update) {
            throw new Exception("Could not prepare order update.");
        }

        $update->bind_param("i", $order_id);

        if (!$update->execute()) {
            throw new Exception("Could not update order status.");
        }

        $update->close();
        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Payment successfully recorded!",
            "payment_id" => $payment_id,
            "order_id" => $order_id,
            "order_number" => $order["order_number"],
            "customer_name" => getCustomerName($order),
            "total_amount" => $total_amount,
            "amount_paid" => $amount_paid,
            "change_amount" => $change_amount,
            "payment_method" => $payment_method,
            "payment_status" => "Paid"
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }

    $conn->close();
    exit;
}

echo json_encode([
    "success" => false,
    "message" => "Invalid request method."
]);

$conn->close();
?>
