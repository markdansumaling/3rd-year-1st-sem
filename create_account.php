<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5185");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// =====================================================
// OPTIONS / PREFLIGHT
// =====================================================

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// =====================================================
// CHECK METHOD
// =====================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

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
// GET JSON INPUT
// =====================================================

$input = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($input)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid request data."
    ]);

    exit;
}

// =====================================================
// GET FORM DATA
// =====================================================

$full_name = trim(
    $input["full_name"] ?? ""
);

$username = trim(
    $input["username"] ?? ""
);

$password = $input["password"] ?? "";

$confirm_password =
    $input["confirm_password"] ?? "";

// =====================================================
// VALIDATION
// =====================================================

if (
    $full_name === "" ||
    $username === "" ||
    $password === "" ||
    $confirm_password === ""
) {

    echo json_encode([
        "success" => false,
        "message" => "Please fill in all fields."
    ]);

    exit;
}

// =====================================================
// FULL NAME VALIDATION
// =====================================================

if (strlen($full_name) < 2) {

    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid full name."
    ]);

    exit;
}

// =====================================================
// USERNAME VALIDATION
// =====================================================

if (strlen($username) < 3) {

    echo json_encode([
        "success" => false,
        "message" => "Username must be at least 3 characters."
    ]);

    exit;
}

// =====================================================
// PASSWORD VALIDATION
// =====================================================

if (strlen($password) < 6) {

    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 6 characters."
    ]);

    exit;
}

// =====================================================
// CONFIRM PASSWORD
// =====================================================

if ($password !== $confirm_password) {

    echo json_encode([
        "success" => false,
        "message" => "Passwords do not match."
    ]);

    exit;
}

// =====================================================
// CHECK USERNAME
// =====================================================

$stmt_check = $conn->prepare(
    "SELECT user_id
     FROM users
     WHERE username = ?
     LIMIT 1"
);

if (!$stmt_check) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare username check.",
        "error" => $conn->error
    ]);

    exit;
}

$stmt_check->bind_param(
    "s",
    $username
);

if (!$stmt_check->execute()) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to check username.",
        "error" => $stmt_check->error
    ]);

    $stmt_check->close();

    exit;
}

$result = $stmt_check->get_result();

if ($result->num_rows > 0) {

    echo json_encode([
        "success" => false,
        "message" => "Username is already taken. Please choose another username."
    ]);

    $stmt_check->close();

    exit;
}

$stmt_check->close();

// =====================================================
// HASH PASSWORD
// =====================================================

$hashed_password =
    password_hash(
        $password,
        PASSWORD_DEFAULT
    );

if (!$hashed_password) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to secure password."
    ]);

    exit;
}

// =====================================================
// CUSTOMER ROLE
// =====================================================

$role = "Customer";

// =====================================================
// INSERT USER
// =====================================================

$stmt = $conn->prepare(
    "INSERT INTO users
    (
        username,
        password,
        full_name,
        role
    )
    VALUES
    (
        ?,
        ?,
        ?,
        ?
    )"
);

if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to prepare account creation.",
        "error" => $conn->error
    ]);

    exit;
}

// =====================================================
// BIND
// =====================================================

$stmt->bind_param(
    "ssss",
    $username,
    $hashed_password,
    $full_name,
    $role
);

// =====================================================
// INSERT
// =====================================================

if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "message" => "Failed to create account.",
        "error" => $stmt->error
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

// =====================================================
// SUCCESS
// =====================================================

$new_user_id =
    $stmt->insert_id;

echo json_encode([
    "success" => true,
    "message" => "Customer account created successfully!",
    "user_id" => $new_user_id,
    "username" => $username,
    "full_name" => $full_name,
    "role" => $role
]);

// =====================================================
// CLOSE
// =====================================================

$stmt->close();
$conn->close();

exit;

?>
