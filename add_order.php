<?php

session_start();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json; charset=UTF-8");

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
| ONLY POST
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
| Your database file is database.php
*/

require_once __DIR__ . "/database.php";

/*
|--------------------------------------------------------------------------
| DATABASE CONNECTION
|--------------------------------------------------------------------------
*/

if (!isset($conn) || !$conn) {
    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| GET FORM DATA
|--------------------------------------------------------------------------
*/

$customer_id = $_POST["customer_id"] ?? "";
$service_id = $_POST["service_id"] ?? "";
$document_name = $_POST["document_name"] ?? "";
$pages = $_POST["pages"] ?? "";
$copies = $_POST["copies"] ?? "";
$print_type = $_POST["print_type"] ?? "";
$paper_size = $_POST["paper_size"] ?? "";
$print_mode = $_POST["print_mode"] ?? "";

/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

if (
    $customer_id === "" ||
    $service_id === "" ||
    trim($document_name) === "" ||
    $pages === "" ||
    $copies === "" ||
    $print_type === "" ||
    $paper_size === "" ||
    $print_mode === ""
) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Please complete all required fields."
    ]);

    exit;
}

$customer_id = (int) $customer_id;
$service_id = (int) $service_id;
$pages = (int) $pages;
$copies = (int) $copies;

$document_name = trim($document_name);
$print_type = trim($print_type);
$paper_size = trim($paper_size);
$print_mode = trim($print_mode);

if ($customer_id <= 0) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid customer ID."
    ]);

    exit;
}

if ($service_id <= 0) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid service ID."
    ]);

    exit;
}

if ($pages <= 0) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Pages must be greater than zero."
    ]);

    exit;
}

if ($copies <= 0) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Copies must be greater than zero."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

try {

    /*
    |--------------------------------------------------------------------------
    | GET CUSTOMER
    |--------------------------------------------------------------------------
    */

    $customerSql = "
        SELECT
            user_id,
            full_name,
            username,
            role
        FROM users
        WHERE user_id = ?
        LIMIT 1
    ";

    $customerStmt = $conn->prepare($customerSql);

    if (!$customerStmt) {
        throw new Exception(
            "Customer query failed: " . $conn->error
        );
    }

    $customerStmt->bind_param(
        "i",
        $customer_id
    );

    $customerStmt->execute();

    $customerResult =
        $customerStmt->get_result();

    if ($customerResult->num_rows === 0) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Customer was not found."
        ]);

        exit;
    }

    $customer =
        $customerResult->fetch_assoc();

    $customerStmt->close();

    /*
    |--------------------------------------------------------------------------
    | GET SERVICE
    |--------------------------------------------------------------------------
    */

    $serviceSql = "
        SELECT
            service_id,
            service_name,
            price,
            status
        FROM services
        WHERE service_id = ?
        LIMIT 1
    ";

    $serviceStmt = $conn->prepare($serviceSql);

    if (!$serviceStmt) {
        throw new Exception(
            "Service query failed: " . $conn->error
        );
    }

    $serviceStmt->bind_param(
        "i",
        $service_id
    );

    $serviceStmt->execute();

    $serviceResult =
        $serviceStmt->get_result();

    if ($serviceResult->num_rows === 0) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Selected service was not found."
        ]);

        exit;
    }

    $service =
        $serviceResult->fetch_assoc();

    $serviceStmt->close();

    /*
    |--------------------------------------------------------------------------
    | CHECK SERVICE STATUS
    |--------------------------------------------------------------------------
    */

    if (
        isset($service["status"]) &&
        strtolower((string)$service["status"]) !== "active"
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Selected service is not active."
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | PRICE
    |--------------------------------------------------------------------------
    */

    $service_price =
        (float) ($service["price"] ?? 0);

    /*
    |--------------------------------------------------------------------------
    | TOTAL
    |--------------------------------------------------------------------------
    */

    $total_amount =
        $service_price *
        $pages *
        $copies;

    /*
    |--------------------------------------------------------------------------
    | ORDER NUMBER
    |--------------------------------------------------------------------------
    */

    $order_number =
        "ORD-" .
        date("YmdHis") .
        "-" .
        random_int(100, 999);

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    $status = "Pending";

    /*
    |--------------------------------------------------------------------------
    | INSERT ORDER
    |--------------------------------------------------------------------------
    */

    $insertSql = "
        INSERT INTO orders (
            order_number,
            customer_id,
            service_id,
            document_name,
            pages,
            copies,
            print_type,
            paper_size,
            print_mode,
            total_amount,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ";

    $insertStmt =
        $conn->prepare($insertSql);

    if (!$insertStmt) {
        throw new Exception(
            "Order insert query failed: " . $conn->error
        );
    }

    $insertStmt->bind_param(
        "siisiisssds",
        $order_number,
        $customer_id,
        $service_id,
        $document_name,
        $pages,
        $copies,
        $print_type,
        $paper_size,
        $print_mode,
        $total_amount,
        $status
    );

    if (!$insertStmt->execute()) {
        throw new Exception(
            "Order could not be created: " .
            $insertStmt->error
        );
    }

    $order_id =
        $conn->insert_id;

    $insertStmt->close();

    /*
    |--------------------------------------------------------------------------
    | SUCCESS RESPONSE
    |--------------------------------------------------------------------------
    */

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "message" => "Order successfully created.",
        "order_id" => $order_id,
        "order_number" => $order_number,
        "customer_id" => $customer_id,
        "customer_name" =>
            $customer["full_name"] ??
            $customer["username"] ??
            "Customer",
        "service_id" => $service_id,
        "service_name" =>
            $service["service_name"] ?? "",
        "service_price" => $service_price,
        "pages" => $pages,
        "copies" => $copies,
        "total_amount" => $total_amount,
        "status" => $status
    ]);

    exit;

} catch (Throwable $e) {

    error_log(
        "ADD ORDER ERROR: " .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Unable to create order: " .
            $e->getMessage()
    ]);

    exit;
}
?>
