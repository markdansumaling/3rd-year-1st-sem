<?php

session_start();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

header("Content-Type: application/json");

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

$allowedOrigins = [
    "http://localhost:5185",
    "http://localhost:5173",
    "http://localhost:5178",
    "http://localhost:5180",
    "http://localhost:5181",
    "http://localhost:5183",
    "http://localhost:5184"
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


/*
|--------------------------------------------------------------------------
| OPTIONS / PREFLIGHT
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}


/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

require_once "../database.php";


/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["user_id"])) {

    echo json_encode([
        "success" => false,
        "message" => "Not logged in."
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| USER INFORMATION
|--------------------------------------------------------------------------
*/

$user_id = $_SESSION["user_id"];

$username = $_SESSION["username"] ?? "";

$full_name = $_SESSION["full_name"] ?? "";

$role = $_SESSION["role"] ?? "";


/*
|--------------------------------------------------------------------------
| TOTAL ORDERS
|--------------------------------------------------------------------------
*/

$total_orders = 0;

$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM orders
");

if ($result) {

    $row = $result->fetch_assoc();

    $total_orders = (int)$row["total"];
}


/*
|--------------------------------------------------------------------------
| PENDING ORDERS
|--------------------------------------------------------------------------
*/

$pending_orders = 0;

$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM orders
    WHERE status = 'Pending'
");

if ($result) {

    $row = $result->fetch_assoc();

    $pending_orders = (int)$row["total"];
}


/*
|--------------------------------------------------------------------------
| COMPLETED ORDERS
|--------------------------------------------------------------------------
*/

$completed_orders = 0;

$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM orders
    WHERE status = 'Completed'
");

if ($result) {

    $row = $result->fetch_assoc();

    $completed_orders = (int)$row["total"];
}


/*
|--------------------------------------------------------------------------
| TOTAL SALES
|--------------------------------------------------------------------------
*/

$total_sales = 0;

$result = $conn->query("
    SELECT COALESCE(SUM(amount_paid), 0) AS total
    FROM payments
");

if ($result) {

    $row = $result->fetch_assoc();

    $total_sales = (float)$row["total"];
}


/*
|--------------------------------------------------------------------------
| ACTIVE SERVICES
|--------------------------------------------------------------------------
*/

$active_services = 0;

$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM services
    WHERE status = 'Active'
");

if ($result) {

    $row = $result->fetch_assoc();

    $active_services = (int)$row["total"];
}


/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,

    "user" => [
        "user_id" => $user_id,
        "username" => $username,
        "full_name" => $full_name,
        "role" => $role
    ],

    "statistics" => [
        "total_orders" => $total_orders,
        "pending_orders" => $pending_orders,
        "completed_orders" => $completed_orders,
        "total_sales" => $total_sales,
        "active_services" => $active_services
    ]
]);


/*
|--------------------------------------------------------------------------
| CLOSE DATABASE
|--------------------------------------------------------------------------
*/

$conn->close();

?>