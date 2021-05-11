<?php
    /**
     * php script to handle AJAX calls for validating and cropping the avatar
     * returns the file path to the uploaded and cropped version of the image in the "avatar" field
     * returns an empty string in case of an invalid file
     * 
     * this is used by profile.js to display a preview of the avatar
     * this could be done purely client side, but it leads to issues:
     * - the cropping and validating of the avatar has to be coded twice, in php and js
     * - php and js dont handle images the same way, as a result the preview might differ from the actual uploaded file
     * EG: an image might lose its transparency when cropping with php, while this wont happen with js
     * 
     * as a result i decided to handle the preview of the uploaded image server side
     * i feel like those issues outweigh the negatives of more server load and a slightly slower user experience
     */

    header("Content-Type: text/plain");
    require_once __DIR__."/../upload.php";
    require_once ROOT."components/initUser.php";

    if (!isset($_FILES["avatar"]))
        echo "";
    else {
        $avatar = uploadAvatar($_FILES["avatar"]);
        if ($avatar == "") echo "";
        else {
            $tempAvatar = dirname($avatar)."/".encode(strtolower($user["username"]));
            moveFile(ROOT.$avatar, ROOT.$tempAvatar);
            echo $tempAvatar;
        }
    }
?>
