
<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . "/database.php";

// Check kung naka-login ang Admin
if (!isset($_SESSION["user_id"]) || strtolower($_SESSION["role"] ?? "") !== "admin") {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Admin access required."
    ]);

    exit;
}

try {
    // Kunin ang customer accounts mula sa users table
    $stmt = $conn->prepare("
        SELECT user_id, username, full_name, role
        FROM users
        WHERE LOWER(role) = 'customer'
        ORDER BY user_id DESC
    ");

    if (!$stmt) {
        throw new Exception("Database query error.");
    }

    if (!$stmt->execute()) {
        throw new Exception("Unable to retrieve customers.");
    }

    $result = $stmt->get_result();
    $customers = [];

    while ($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "customers" => $customers
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
