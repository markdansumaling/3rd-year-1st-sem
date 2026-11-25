<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

// =====================================================
// CORS PREFLIGHT
// =====================================================

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {

    http_response_code(200);
    exit;
}

// =====================================================
// METHOD CHECK
// =====================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);

    exit;
}

// =====================================================
// DATABASE
// =====================================================

require_once "../database.php";

// =====================================================
// DATABASE CHECK
// =====================================================

if (!$conn) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}

// =====================================================
// LOGIN CHECK
// =====================================================

if (!isset($_SESSION["user_id"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Unauthorized. Please login first."
    ]);

    exit;
}

// =====================================================
// ADMIN CHECK
// =====================================================

$role = strtolower(
    trim($_SESSION["role"] ?? "")
);

if ($role !== "admin") {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Admin access required."
    ]);

    exit;
}

// =====================================================
// READ JSON DATA
// =====================================================

$rawData = file_get_contents("php://input");

$data = json_decode(
    $rawData,
    true
);

// =====================================================
// JSON VALIDATION
// =====================================================

if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data."
    ]);

    exit;
}

// =====================================================
// GET VALUES
// =====================================================

$order_id = (int)(
    $data["order_id"] ?? 0
);

$status = trim(
    $data["status"] ?? ""
);

// =====================================================
// VALIDATE ORDER ID
// =====================================================

if ($order_id <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid order ID."
    ]);

    exit;
}

// =====================================================
// ALLOWED STATUSES
// =====================================================

$allowedStatuses = [
    "Pending",
    "Processing",
    "Ready",
    "Completed",
    "Cancelled"
];

// =====================================================
// VALIDATE STATUS
// =====================================================

if (!in_array(
    $status,
    $allowedStatuses,
    true
)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid order status.",
        "allowed_statuses" => $allowedStatuses
    ]);

    exit;
}

// =====================================================
// CHECK ORDER EXISTS
// =====================================================

$stmtCheck = $conn->prepare("
    SELECT
        order_id,
        status
    FROM orders
    WHERE order_id = ?
    LIMIT 1
");

if (!$stmtCheck) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare order check."
    ]);

    $conn->close();
    exit;
}

$stmtCheck->bind_param(
    "i",
    $order_id
);

if (!$stmtCheck->execute()) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to check order.",
        "error" => $stmtCheck->error
    ]);

    $stmtCheck->close();
    $conn->close();
    exit;
}

$result = $stmtCheck->get_result();

if ($result->num_rows === 0) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Order not found."
    ]);

    $stmtCheck->close();
    $conn->close();
    exit;
}

$order = $result->fetch_assoc();

$oldStatus = $order["status"];

$stmtCheck->close();

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

$stmt = $conn->prepare("
    UPDATE orders
    SET status = ?
    WHERE order_id = ?
");

if (!$stmt) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare order update."
    ]);

    $conn->close();
    exit;
}

$stmt->bind_param(
    "si",
    $status,
    $order_id
);

// =====================================================
// EXECUTE UPDATE
// =====================================================

if (!$stmt->execute()) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to update order status.",
        "error" => $stmt->error
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

// =====================================================
// SUCCESS RESPONSE
// =====================================================

echo json_encode([
    "success" => true,
    "message" => "Order status updated successfully.",
    "order_id" => $order_id,
    "old_status" => $oldStatus,
    "status" => $status
]);

// =====================================================
// CLOSE
// =====================================================

$stmt->close();
$conn->close();

exit;

?>
