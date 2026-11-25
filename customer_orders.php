<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// =====================================================
// HANDLE OPTIONS / PREFLIGHT
// =====================================================

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// =====================================================
// DATABASE CONNECTION
// database.php is in the main project folder
// =====================================================

require_once dirname(__DIR__) . "/database.php";

// =====================================================
// CHECK LOGIN
// =====================================================

if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "User is not logged in."
    ]);

    exit;
}

$userId = (int) $_SESSION["user_id"];

// =====================================================
// GET CUSTOMER ORDERS
// =====================================================

try {

    $sql = "
        SELECT
            o.order_id,
            o.order_number,
            o.customer_id,
            o.customer_name,
            o.document_name,
            o.pages,
            o.copies,
            o.print_type,
            o.paper_size,
            o.print_mode,
            o.total_amount,
            o.status,
            o.created_at,
            s.service_name
        FROM orders o
        LEFT JOIN services s
            ON o.service_id = s.service_id
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {

        throw new Exception(
            "Failed to prepare database query: " .
            $conn->error
        );
    }

    $stmt->bind_param(
        "i",
        $userId
    );

    if (!$stmt->execute()) {

        throw new Exception(
            "Failed to execute database query: " .
            $stmt->error
        );
    }

    $result = $stmt->get_result();

    $orders = [];

    while ($row = $result->fetch_assoc()) {

        $orders[] = $row;
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "orders" => $orders
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();

exit;

?>
