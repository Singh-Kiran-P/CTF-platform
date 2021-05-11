<?php
    /**
     * php script to handle AJAX calls for reloading the profile bar and popup menu
     * uses $_POST["link"] as the link to show profile bar as
     */

    require_once __DIR__."/../../components/initUser.php";
    $_SERVER["REQUEST_URI"] = $_POST["link"];
    parse_str(parse_url($_POST["link"], PHP_URL_QUERY), $_GET);
    require ROOT."components/profileBar.php";
?>
