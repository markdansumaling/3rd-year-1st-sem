<?php

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "../database.php";

/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized. Please login first."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| CHECK REQUEST METHOD
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| GET JSON DATA
|--------------------------------------------------------------------------
*/

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$order_id = (int)($data["order_id"] ?? 0);

/*
|--------------------------------------------------------------------------
| VALIDATE ORDER ID
|--------------------------------------------------------------------------
*/

if ($order_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid order ID."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| CHECK IF ORDER EXISTS
|--------------------------------------------------------------------------
*/

$check = $conn->prepare("
    SELECT order_id
    FROM orders
    WHERE order_id = ?
");

if (!$check) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare order check."
    ]);
    exit;
}

$check->bind_param(
    "i",
    $order_id
);

$check->execute();

$result = $check->get_result();

if ($result->num_rows === 0) {

    $check->close();

    echo json_encode([
        "success" => false,
        "message" => "Order not found."
    ]);

    exit;
}

$check->close();

/*
|--------------------------------------------------------------------------
| DELETE ORDER
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    DELETE FROM orders
    WHERE order_id = ?
");

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to prepare delete query."
    ]);
    exit;
}

$stmt->bind_param(
    "i",
    $order_id
);

/*
|--------------------------------------------------------------------------
| EXECUTE DELETE
|--------------------------------------------------------------------------
*/

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Order deleted successfully."
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to delete order.",
        "error" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();

?>