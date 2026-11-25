<?php

session_start();

header("Content-Type: application/json; charset=UTF-8");

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (preg_match('/^http:\/\/localhost:\d+$/', $origin)) {
    header("Access-Control-Allow-Origin: " . $origin);
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

/*
|--------------------------------------------------------------------------
| PREFLIGHT
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
| ONLY POST
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
| GET JSON
|--------------------------------------------------------------------------
*/

$rawData = file_get_contents("php://input");

$data = json_decode($rawData, true);

if (!is_array($data)) {

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| LOGIN DATA
|--------------------------------------------------------------------------
*/

$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

if ($username === "" || $password === "") {

    echo json_encode([
        "success" => false,
        "message" => "Please enter your username and password."
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| FIND USER
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT
        user_id,
        username,
        password,
        full_name,
        role
    FROM users
    WHERE username = ?
    LIMIT 1
");

if (!$stmt) {

    echo json_encode([
        "success" => false,
        "message" => "Database query error.",
        "error" => $conn->error
    ]);

    exit;
}

$stmt->bind_param("s", $username);

if (!$stmt->execute()) {

    echo json_encode([
        "success" => false,
        "message" => "Unable to execute login query.",
        "error" => $stmt->error
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

$result = $stmt->get_result();

/*
|--------------------------------------------------------------------------
| USER NOT FOUND
|--------------------------------------------------------------------------
*/

if ($result->num_rows !== 1) {

    echo json_encode([
        "success" => false,
        "message" => "Incorrect username or password."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

/*
|--------------------------------------------------------------------------
| USER
|--------------------------------------------------------------------------
*/

$user = $result->fetch_assoc();

/*
|--------------------------------------------------------------------------
| PASSWORD
|--------------------------------------------------------------------------
*/

if (!password_verify(
    $password,
    $user["password"]
)) {

    echo json_encode([
        "success" => false,
        "message" => "Incorrect username or password."
    ]);

    $stmt->close();
    $conn->close();

    exit;
}

/*
|--------------------------------------------------------------------------
| CLEAN FULL NAME
|--------------------------------------------------------------------------
*/

$full_name = trim(
    $user["full_name"] ?? ""
);

/*
|--------------------------------------------------------------------------
| SESSION
|--------------------------------------------------------------------------
*/

session_regenerate_id(true);

$_SESSION["user_id"] =
    (int) $user["user_id"];

$_SESSION["username"] =
    $user["username"];

$_SESSION["full_name"] =
    $full_name;

$_SESSION["role"] =
    $user["role"];

/*
|--------------------------------------------------------------------------
| SUCCESS
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "message" =>
        "Login successful.",

    "user" => [

        "user_id" =>
            (int) $user["user_id"],

        "username" =>
            $user["username"],

        "full_name" =>
            $full_name,

        "role" =>
            $user["role"]
    ]

]);

$stmt->close();
$conn->close();

exit;

?>
