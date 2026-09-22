<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$uploadDir = 'uploads/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['audio'])) {
        $file = $_FILES['audio'];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(500);
            echo "Upload error: " . $file['error'];
            exit;
        }
        
        $filename = 'astra_' . date('Y-m-d_H-i-s') . '_' . uniqid() . '.wav';
        $filepath = $uploadDir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            echo "Success: " . $filename;
        } else {
            http_response_code(500);
            echo "Failed to save";
        }
    } else {
        http_response_code(400);
        echo "No audio received";
    }
} else {
    http_response_code(405);
    echo "Method not allowed";
}
?>
