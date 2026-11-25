<?php

// =====================================================
// CORS
// =====================================================

header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle browser preflight request
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// =====================================================
// SESSION
// =====================================================

session_start();

// =====================================================
// DATABASE
// =====================================================

require_once "database.php";

// =====================================================
// ONLY POST
// =====================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

// =====================================================
// GET JSON DATA
// =====================================================

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data."
    ]);
    exit;
}

// =====================================================
// GET VALUES
// =====================================================

$user_id = $input["user_id"] ?? null;

$full_name = trim(
    $input["full_name"] ?? ""
);

$username = trim(
    $input["username"] ?? ""
);

// =====================================================
// VALIDATION
// =====================================================

if (!$user_id || !$full_name || !$username) {
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all fields."
    ]);
    exit;
}

if (!is_numeric($user_id)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid user ID."
    ]);
    exit;
}

if (strlen($full_name) < 2) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid full name."
    ]);
    exit;
}

if (strlen($username) < 3) {
    echo json_encode([
        "success" => false,
        "message" => "Username must be at least 3 characters."
    ]);
    exit;
}

$user_id = (int) $user_id;

// =====================================================
// CHECK USER EXISTS
// =====================================================

$stmt = $conn->prepare(
    "SELECT user_id, role
     FROM users
     WHERE user_id = ?
     LIMIT 1"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);
    exit;
}

$stmt->bind_param(
    "i",
    $user_id
);

$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();

    echo json_encode([
        "success" => false,
        "message" => "User account not found."
    ]);
    exit;
}

$currentUser = $result->fetch_assoc();

$stmt->close();

// =====================================================
// CHECK USERNAME
// =====================================================

$check = $conn->prepare(
    "SELECT user_id
     FROM users
     WHERE username = ?
     AND user_id != ?
     LIMIT 1"
);

if (!$check) {
    echo json_encode([
        "success" => false,
        "message" => "Database error."
    ]);
    exit;
}

$check->bind_param(
    "si",
    $username,
    $user_id
);

$check->execute();

$result = $check->get_result();

if ($result->num_rows > 0) {
    $check->close();

    echo json_encode([
        "success" => false,
        "message" => "Username is already taken."
    ]);
    exit;
}

$check->close();

// =====================================================
// UPDATE PROFILE
// =====================================================

$stmt = $conn->prepare(
    "UPDATE users
     SET full_name = ?, username = ?
     WHERE user_id = ?"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare profile update."
    ]);
    exit;
}

$stmt->bind_param(
    "ssi",
    $full_name,
    $username,
    $user_id
);

if (!$stmt->execute()) {
    $stmt->close();

    echo json_encode([
        "success" => false,
        "message" => "Unable to update profile."
    ]);
    exit;
}

$stmt->close();

// =====================================================
// GET UPDATED USER
// =====================================================

$stmt = $conn->prepare(
    "SELECT
        user_id,
        username,
        full_name,
        role
     FROM users
     WHERE user_id = ?
     LIMIT 1"
);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Profile updated, but user data could not be loaded."
    ]);
    exit;
}

$stmt->bind_param(
    "i",
    $user_id
);

$stmt->execute();

$result = $stmt->get_result();

$user = $result->fetch_assoc();

$stmt->close();

// =====================================================
// RESPONSE
// =====================================================

echo json_encode([
    "success" => true,
    "message" => "Profile updated successfully!",
    "user" => $user
]);

$conn->close();

?>
