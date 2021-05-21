<?php
    /**
     * script to make reservations for visitors
     */

    require_once __DIR__."/../database.php";
    require_once ROOT."components/initUser.php";

    $zoneid = isset($_POST["zoneid"]) ? intval($_POST["zoneid"]) : redirect();
    $size = isset($_POST["size"]) ? intval($_POST["size"]) : redirect();

    if ($user["profiletype"] != VISITOR) redirect();
    if (!exists("zones", ["id" => $zoneid])) redirect();
    if ($size < 1 || $size > 10) redirect();
    
    $zoneData = entry("zones", ["id" => $zoneid]);
    $timeslots = isset($_POST["timeslots"]) ? $_POST["timeslots"] : [];
    if (!is_array($timeslots)) redirect();
    foreach ($timeslots as $timeslot) {
        $timeslot = intval($timeslot);
        if ($timeslot <= time()) continue;
        $reservationCount = reservationCount($zoneid, $timeslot);
        $queued = $reservationCount + $size > $zoneData["capacity"];
        
        insert("reservations", [
            "zone" => $zoneid,
            "visitor" => $user["username"],
            "timeslot" => $timeslot,
            "size" => $size,
            "queued" => $queued
        ]);

        updateFairSum($zoneData["fair"], "reservations", 1);
    }

    redirect(ZONE_PAGE.$zoneid);
?>
