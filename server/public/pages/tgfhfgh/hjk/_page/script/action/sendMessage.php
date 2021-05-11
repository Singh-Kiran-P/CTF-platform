<?php
    /**
     * php script to send a message
     * redirects back to the redirect page if a redirect is provided
     */

    require_once __DIR__."/../database.php";
    require_once ROOT."components/initUser.php";

    $form = $_POST;

    if (isset($form["receiver"]) && isset($form["content"])) {
        if (!empty(trim($form["content"])))
            insert("messages", [
                "sender" => $user["username"],
                "receiver" => $form["receiver"],
                "content" => htmlspecialchars(trim($form["content"])),
                "timestamp" => time(),
                "state" => "unread"
            ]);
    }

    if (isset($form["redirect"])) redirect($form["redirect"]);
?>
