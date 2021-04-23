<?php
    /**
     * php script to log in an existing user
     */

    require_once __DIR__."/../validation.php";
    $form = $_POST;

    // if the user exists and gave the correct password
    if (validForm($form, ["loginUsername", "loginPassword"])) {
        login($form["loginUsername"]); // log the user in to their profile
        redirect(HOME_PAGE); // and redirect to the home page
    }
    
    redirect(LOGIN_PAGE); // on invalid input
?>
