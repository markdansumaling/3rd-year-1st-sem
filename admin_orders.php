
<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

session_start();

// CORS PREFLIGHT
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// METHOD CHECK
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only GET requests are allowed."
    ]);

    exit;
}

// DATABASE
require_once __DIR__ . "/../config/database.php";

if (!$conn) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}

// LOGIN CHECK
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "You are not logged in."
    ]);

    exit;
}

// ADMIN CHECK
$role = strtolower(trim($_SESSION["role"] ?? ""));

if ($role !== "admin") {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Admin access required."
    ]);

    exit;
}

// GET ORDERS + CUSTOMER + SERVICE + PAYMENT PROOF
$sql = "
    SELECT
        o.*,

        /* CUSTOMER */
        u.user_id AS customer_user_id,
        u.full_name AS user_full_name,
        u.username AS user_username,

        /* SERVICE */
        s.service_name AS actual_service_name,
        s.price AS service_price,

        /* PAYMENT DETAILS */
        p.payment_id AS payment_record_id,
        p.amount_paid AS amount_paid,
        p.payment_method AS payment_method,
        p.payment_status AS payment_status,
        p.proof_of_payment AS proof_of_payment,
        p.payment_date AS payment_date

    FROM orders o

    LEFT JOIN users u
        ON o.customer_id = u.user_id

    LEFT JOIN services s
        ON o.service_id = s.service_id

    LEFT JOIN payments p
        ON o.order_id = p.order_id

    ORDER BY o.created_at DESC
";

// EXECUTE QUERY
$result = mysqli_query($conn, $sql);

if (!$result) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database query failed."
    ]);

    error_log("Admin orders query failed: " . mysqli_error($conn));
    exit;
}

// PREPARE ORDERS
$orders = [];

while ($row = mysqli_fetch_assoc($result)) {

    // CUSTOMER NAME
    if (!empty($row["user_full_name"])) {
        $row["customer_name"] = $row["user_full_name"];
    } elseif (!empty($row["user_username"])) {
        $row["customer_name"] = $row["user_username"];
    } elseif (empty($row["customer_name"])) {
        $row["customer_name"] = "Unknown Customer";
    }

    // CUSTOMER ID
    $row["customer_id"] = $row["customer_id"] ?? null;

    // SERVICE NAME
    if (!empty($row["actual_service_name"])) {
        $row["service_name"] = $row["actual_service_name"];
    } else {
        $row["service_name"] =
            "Service #" . ($row["service_id"] ?? "—");
    }

    // SERVICE PRICE
    $row["service_price"] =
        (float)($row["service_price"] ?? 0);

    // ORDER DETAILS
    $row["pages"] = (int)($row["pages"] ?? 0);
    $row["copies"] = (int)($row["copies"] ?? 0);
    $row["total_amount"] =
        (float)($row["total_amount"] ?? 0);

    // ORDER STATUS
    if (empty($row["status"])) {
        $row["status"] = "Pending";
    }

    // PAYMENT DETAILS
    $row["amount_paid"] =
        $row["amount_paid"] !== null
            ? (float)$row["amount_paid"]
            : 0;

    $row["payment_method"] =
        $row["payment_method"] ?? null;

    $row["proof_of_payment"] =
        $row["proof_of_payment"] ?? null;

    $row["payment_date"] =
        $row["payment_date"] ?? null;

    // Do not treat a submitted receipt as an approved payment.
    $row["payment_status"] =
        $row["payment_status"] ?? "Unpaid";

    // REMOVE INTERNAL JOIN COLUMNS
    unset(
        $row["user_full_name"],
        $row["user_username"],
        $row["actual_service_name"]
    );

    $orders[] = $row;
}

// RESPONSE
echo json_encode([
    "success" => true,
    "message" => "Orders loaded successfully.",
    "count" => count($orders),
    "orders" => $orders
]);

exit;
?>
