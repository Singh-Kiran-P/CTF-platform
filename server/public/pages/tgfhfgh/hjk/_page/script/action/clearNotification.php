<?php
    /**
     * php script to clear a notification, also used in AJAX calls
     * clears the notification for which the form was submitted
     * handles a review in case a review was submitted
     * redirects back to the redirect page if a redirect is provided
     */

    require_once __DIR__."/../database.php";
    require_once ROOT."components/initUser.php";

    /**
     * redirects in case $_POST["redirect"] is set, dies otherwise
     * called at the end of the script or upon invalid input
     */
    function done() {
        isset($_POST["redirect"]) ? redirect($_POST["redirect"]) : die();
    }

    $form = $_POST;
    $type = isset($form["type"]) ? $form["type"] : "";
    $notificationid = isset($form["notificationid"]) && is_numeric($form["notificationid"]) ? intval($form["notificationid"]) : done();
    if (!exists("notifications", ["id" => $notificationid])) done();
    if (strcasecmp($user["username"], entry("notifications", ["id" => $notificationid])["receiver"]) != 0) done();

    if ($type == "review" && isset($form["reviewzone"]) && is_numeric($form["reviewzone"]) && exists("zones", ["id" => intval($form["reviewzone"])])) {
        $review = isset($form["review"]) && !empty(trim($form["review"])) ? $form["review"] : null;
        $rating = isset($form["rating"]) && is_numeric($form["rating"]) ? intval($form["rating"]) : null;
        $organizer = entry("fairs", ["id" => entry("zones", ["id" => intval($form["reviewzone"])])["fair"]])["organizer"];
        if (!($review == null && $rating == null))
            sendNotification("showreview", ["review" => $review, "rating" => $rating, "zoneid" => intval($form["reviewzone"])], $organizer);
    }

    deleteFrom("notifications", ["id" => $notificationid]);
    done();
?>
