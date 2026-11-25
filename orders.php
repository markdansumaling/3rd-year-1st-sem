<?php

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");

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

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| CUSTOMER ID
|--------------------------------------------------------------------------
*/

$customer_id = (int) $_SESSION["user_id"];

if ($customer_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid customer information."
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| GET CUSTOMER ORDERS + PAYMENT
|--------------------------------------------------------------------------
|
| orders.order_id
|       ↓
| payments.order_id
|
| LEFT JOIN means the order will still appear even
| if it does not have a payment record yet.
|
*/

$sql = "
    SELECT
        o.order_id,
        o.order_number,
        o.customer_id,
        o.customer_name,
        o.service_id,
        s.service_name,
        o.document_name,
        o.pages,
        o.copies,
        o.print_type,
        o.paper_size,
        o.print_mode,
        o.total_amount,
        o.status,
        o.created_at,

        p.payment_id,
        p.amount_paid,
        p.change_amount,
        p.payment_status,
        p.payment_method,
        p.payment_date

    FROM orders o

    LEFT JOIN services s
        ON o.service_id = s.service_id

    LEFT JOIN payments p
        ON o.order_id = p.order_id

    WHERE o.customer_id = ?

    ORDER BY o.order_id DESC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare orders query.",
        "error" => $conn->error
    ]);
    exit;
}

$stmt->bind_param(
    "i",
    $customer_id
);

$stmt->execute();

$result = $stmt->get_result();

/*
|--------------------------------------------------------------------------
| BUILD ORDERS ARRAY
|--------------------------------------------------------------------------
*/

$orders = [];

while ($row = $result->fetch_assoc()) {

    $orders[] = [
        "order_id" =>
            (int) $row["order_id"],

        "order_number" =>
            $row["order_number"],

        "customer_id" =>
            (int) $row["customer_id"],

        "customer_name" =>
            $row["customer_name"],

        "service_id" =>
            (int) $row["service_id"],

        "service_name" =>
            $row["service_name"] ?? "N/A",

        "document_name" =>
            $row["document_name"],

        "pages" =>
            (int) $row["pages"],

        "copies" =>
            (int) $row["copies"],

        "print_type" =>
            $row["print_type"],

        "paper_size" =>
            $row["paper_size"],

        "print_mode" =>
            $row["print_mode"],

        "total_amount" =>
            (float) $row["total_amount"],

        "status" =>
            $row["status"] ?? "Pending",

        /*
        |--------------------------------------------------------------------------
        | PAYMENT
        |--------------------------------------------------------------------------
        */

        "payment_id" =>
            $row["payment_id"]
                ? (int) $row["payment_id"]
                : null,

        "amount_paid" =>
            $row["amount_paid"] !== null
                ? (float) $row["amount_paid"]
                : 0,

        "change_amount" =>
            $row["change_amount"] !== null
                ? (float) $row["change_amount"]
                : 0,

        "payment_status" =>
            $row["payment_status"]
                ?? "Unpaid",

        "payment_method" =>
            $row["payment_method"]
                ?? "Cash",

        "payment_date" =>
            $row["payment_date"],

        /*
        |--------------------------------------------------------------------------
        | ORDER DATE
        |--------------------------------------------------------------------------
        */

        "created_at" =>
            $row["created_at"]
    ];
}

$stmt->close();

/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/

echo json_encode([
    "success" => true,
    "orders" => $orders
]);

$conn->close();

?>
