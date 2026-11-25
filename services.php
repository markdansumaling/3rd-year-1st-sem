<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// =====================================================
// OPTIONS / PREFLIGHT
// =====================================================

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// =====================================================
// DATABASE
// =====================================================

require_once "../database.php";

// =====================================================
// CHECK DATABASE
// =====================================================

if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}

// =====================================================
// LOAD ACTIVE SERVICES
// =====================================================

$sql = "
    SELECT
        service_id,
        service_name,
        price
    FROM services
    WHERE status = 'Active'
    ORDER BY service_name ASC
";

$result = $conn->query($sql);

// =====================================================
// CHECK QUERY
// =====================================================

if (!$result) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to load services.",
        "error" => $conn->error
    ]);

    $conn->close();

    exit;
}

// =====================================================
// SERVICES ARRAY
// =====================================================

$services = [];

while ($row = $result->fetch_assoc()) {

    $services[] = [
        "service_id" => (int)$row["service_id"],
        "service_name" => $row["service_name"],
        "price" => (float)$row["price"]
    ];
}

// =====================================================
// RESPONSE
// =====================================================

echo json_encode([
    "success" => true,
    "services" => $services
]);

$conn->close();

exit;

?>