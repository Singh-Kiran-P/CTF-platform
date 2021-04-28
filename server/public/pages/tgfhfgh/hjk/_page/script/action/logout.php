<?php
    /**
     * php script to log the user out
     */

    require_once __DIR__."/../global.php";

    logout();
    redirect(LOGIN_PAGE);
?>
