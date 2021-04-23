<?php
    /**
     * php script to handle AJAX calls for retrieving form validation
     */

    header("Content-Type: application/json");
    require_once __DIR__."/../validation.php";
    
    echo json_encode(formValidation($_POST));
?>
