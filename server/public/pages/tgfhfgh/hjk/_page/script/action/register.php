<?php
    /**
     * php script to add a new user to the database
     * given a username, email, password and profile type
     */

    require_once __DIR__."/../validation.php";
    $form = $_POST;

    // if all input is valid
    if (validForm($form, ["username", "email", "password", "confirmPassword", "profileType"])) {
        // register the new user
        insert("users", [
            "username" => $form["username"],
            "email" => $form["email"],
            "phoneNumber" => null,
            "password" => $form["password"],
            "avatar" => DEFAULT_AVATAR,
            "description" => $form["profileType"] == ORGANIZER ? DEFAULT_DESCRIPTION : null,
            "profileType" => $form["profileType"]
        ]);
        
        // send a welcome notification
        $header = "Thank you for registering your new ".strtolower($form["profileType"])." account!";
        $body = $form["profileType"] == VISITOR ? "You can discover all available fairs" : "You can start organizing your own fairs";
        $body .= ' on the <a href="'.HOME_PAGE.'">home</a> page';
        sendNotification("custom", ["header" => $header, "body" => $body], $form["username"]);
        login($form["username"]); // log the user in to their profile
        redirect(EDIT_PROFILE_PAGE.$form["username"]); // and redirect to the users edit profile page
    }

    redirect(REGISTER_PAGE); // on invalid input
?>
