<?php
    /**
     * script to save edits to a users profile
     * the "$form = $_POST;" lines are needed
     * as validForm(&$form, $inputNames) removes all fields from $form not provided with $inputNames
     * if you were to pass $_POST as an argument, the $_POST variables would be lost
     */

    require_once __DIR__."/../validation.php";
    require_once ROOT."components/initUser.php";
    require_once ROOT."components/parseQueryParameters.php";

    if (!isset($username)) redirect(); // query parameters not meant for a profile page

    // update the users avatar if it is valid
    if (isset($_FILES["avatar"])) { // if the new avatar is provided
        $avatar = uploadAvatar($_FILES["avatar"]); // attempt to upload the new avatar
        if ($avatar != "") { // if the new avatar is valid and succesfully uploaded
            $oldAvatar = userdata($username)["avatar"];
            if ($oldAvatar != DEFAULT_AVATAR)
                unlink(ROOT.$oldAvatar); // delete the old avatar (if it is not the default avatar)
            update("users", "avatar", $avatar, ["username" => $username]); // and set the new avatar
        }
    }

    // update these fields if they are valid
    // the field name must match the column name in the database
    $inputFields = ["email", "phoneNumber", "description"];
    $nullFields = ["phoneNumber"]; // fields for which an empty string gets turned into a null value
    foreach ($inputFields as $inputField) {
        $form = $_POST;
        if (validForm($form, [$inputField])) {
            $value = $form[$inputField];
            if (in_array($inputField, $nullFields) && $value == "") $value = null;
            update("users", $inputField, $value, ["username" => $username]);
        }
    }

    // update user password if all 3 change password fields are valid
    $form = $_POST;
    if (validForm($form, ["confirmChangeLoginPassword", "password", "confirmPassword"]))
        update("users", "password", $form["password"], ["username" => $username]);

    // update the users username if it is valid, and log the user in with their new username
    $form = $_POST;
    if (validForm($form, ["username"])) {
        $login = $username == $user["username"];
        updateUsername($username, $form["username"]);
        $username = $form["username"];
        if ($login) login($form["username"]);
    }

    // delete the users profile if the 2 fields in the delete profile form are valid
    $form = $_POST;
    if (validForm($form, ["profileUsername", "confirmProfileUsername", "confirmDeleteLoginPassword"])) {
        $logout = $username == $user["username"];
        deleteUser($username);
        if ($logout) logout();
        $username = $user["username"];
    }

    redirect(PROFILE_PAGE.$username); // redirect back to the users profile page
?>
