<?php
    /**
     * php script to cancel a reservation, cancels the reservation given by $_GET["reservation"]
     */

    require_once __DIR__."/../database.php";
    require_once ROOT."components/initUser.php";

    $reservation = isset($_GET["reservation"]) ? $_GET["reservation"] : redirect();
    $reservation = is_numeric($reservation) ? intval($reservation) : redirect();
    $reservation = entry("reservations", ["id" => $reservation]);
    if (empty($reservation)) redirect();
    if ($user["profiletype"] == VISITOR && strcasecmp($user["username"], $reservation["visitor"]) != 0)
        redirect(); // visitors can only cancel their own reservations
    
    cancelReservation($reservation);
    $profile = isset($_GET["redirect"]) && $_GET["redirect"] == "profile"; // whether to redirect back to the profile page
    redirect($profile ? PROFILE_PAGE.$reservation["visitor"] : ZONE_PAGE.$reservation["zone"]);
?>
