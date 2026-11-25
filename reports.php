<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

// =====================================================
// CORS
// =====================================================

if (preg_match('/^http:\/\/localhost:\d+$/', $origin)) {
    header("Access-Control-Allow-Origin: " . $origin);
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

// =====================================================
// OPTIONS REQUEST
// =====================================================

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// =====================================================
// ONLY GET REQUEST
// =====================================================

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);

    exit;
}

// =====================================================
// DATABASE
// =====================================================

require_once "../database.php";

// =====================================================
// CHECK DATABASE CONNECTION
// =====================================================

if (!isset($conn) || !$conn) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}

// =====================================================
// CHECK LOGIN
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
// CHECK ADMIN ROLE
// =====================================================

$role = strtolower(
    trim($_SESSION["role"] ?? "")
);

if ($role !== "admin") {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Access denied. Admin only."
    ]);

    exit;
}

// =====================================================
// DEFAULT VALUES
// =====================================================

$totalRevenue = 0;
$totalOrders = 0;
$completedOrders = 0;
$pendingOrders = 0;

// =====================================================
// TOTAL ORDERS
// =====================================================

$stmt = $conn->prepare("
    SELECT COUNT(*) AS total_orders
    FROM orders
");

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to prepare total orders query.",
        "error" =>
            $conn->error
    ]);

    $conn->close();
    exit;
}

if (!$stmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to load total orders.",
        "error" =>
            $stmt->error
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
    $totalOrders =
        (int) ($row["total_orders"] ?? 0);
}

$stmt->close();

// =====================================================
// COMPLETED ORDERS
// =====================================================

$stmt = $conn->prepare("
    SELECT COUNT(*) AS completed_orders
    FROM orders
    WHERE LOWER(TRIM(status)) = 'completed'
");

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to prepare completed orders query.",
        "error" =>
            $conn->error
    ]);

    $conn->close();
    exit;
}

if (!$stmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to load completed orders.",
        "error" =>
            $stmt->error
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
    $completedOrders =
        (int) ($row["completed_orders"] ?? 0);
}

$stmt->close();

// =====================================================
// PENDING ORDERS
// =====================================================

$stmt = $conn->prepare("
    SELECT COUNT(*) AS pending_orders
    FROM orders
    WHERE LOWER(TRIM(status)) = 'pending'
");

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to prepare pending orders query.",
        "error" =>
            $conn->error
    ]);

    $conn->close();
    exit;
}

if (!$stmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to load pending orders.",
        "error" =>
            $stmt->error
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
    $pendingOrders =
        (int) ($row["pending_orders"] ?? 0);
}

$stmt->close();

// =====================================================
// TOTAL REVENUE
// =====================================================

$stmt = $conn->prepare("
    SELECT COALESCE(
        SUM(total_amount),
        0
    ) AS total_revenue
    FROM orders
    WHERE LOWER(TRIM(status)) = 'completed'
");

if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to prepare revenue query.",
        "error" =>
            $conn->error
    ]);

    $conn->close();
    exit;
}

if (!$stmt->execute()) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Failed to load total revenue.",
        "error" =>
            $stmt->error
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
    $totalRevenue =
        (float) ($row["total_revenue"] ?? 0);
}

$stmt->close();

// =====================================================
// FINAL RESPONSE
// =====================================================

echo json_encode([
    "success" => true,

    "reports" => [
        "total_revenue" =>
            $totalRevenue,

        "total_orders" =>
            $totalOrders,

        "completed_orders" =>
            $completedOrders,

        "pending_orders" =>
            $pendingOrders
    ]
]);

// =====================================================
// CLOSE DATABASE
// =====================================================

$conn->close();

exit;

?>
