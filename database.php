<?php

$host = "localhost";
$username = "root";
$password = "";
$database = "printing_management";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Hindi makakonekta sa database: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");

?>
