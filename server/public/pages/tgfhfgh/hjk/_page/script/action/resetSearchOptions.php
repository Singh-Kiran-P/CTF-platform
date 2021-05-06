<?php
    /**
     * script to reset the search options for the logged in user
     * sets the search options session variable to the default values
     * then redirects back to the home page
     */

    require_once __DIR__."/../global.php";

    unset($_SESSION["filters"]);
    unset($_POST);

    $_POST["orderdirection"] = "descending";
    $_POST["orderby"] = "reservations";
    $_POST["openafter"] = date("Y-m-d");

    require_once __DIR__."/setSearchOptions.php";
?>
