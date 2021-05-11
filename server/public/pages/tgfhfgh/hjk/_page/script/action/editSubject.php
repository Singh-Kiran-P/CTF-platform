<?php
    /**
     * php script to handle the subject actions
     * creates/edits/deletes zones/fairs depending on the $_GET parameters
     */

    require_once __DIR__."/../validation.php";
    require_once ROOT."components/initUser.php";
    require_once ROOT."components/parseQueryParameters.php";

    if (!($fair || $zone)) redirect(); // query parameters meant for a profile page, invalid for editSubject.php
    
    $fairInputFields = ["name", "description", "startdate", "enddate", "starthour", "endhour", "longitude", "latitude"];
    $zoneInputFields = ["name", "description", "capacity", "longitude", "latitude"];
    $table = $fair ? "fairs" : "zones";
    $subject = $fair ? "fair" : "zone";
    $columns = $fair ? $fairInputFields : $zoneInputFields;

    if ($create) { // if the action is to create a new fair or zone
        $form = $_POST;
        if (validForm($form, $columns)) { // verify and parse all input
            $insert = []; // and insert
            if ($fair) $insert["organizer"] = $user["username"]; // the organizer (for fairs)
            if ($zone) $insert["fair"] = $fairid; // the fair id (for zones)
            $retrieve = $insert; // (the parameters used to retrieve the subject after it is inserted)
            foreach ($columns as $column) // and all provided input
                $insert[$column] = $form[$column];
            insert($table, $insert); // into the database

            $id = orderBy(entries($table, $retrieve), "id", SORT_DESC)[0]["id"]; // get the newly inserted subjects id
            if ($fair) $fairid = $id;
            if ($zone) $zoneid = $id;
            
            if ($zone) updateFairSum($fairid, "capacity", $form["capacity"]); // and update the fairs total capacity
        }
        else redirect(); // if the form was invalid
    }
    
    $id = $fair ? $fairid : $zoneid; // the id of the current fair or zone

    if ($edit) { // if the action is to edit an existing fair or zone
        $form = $_POST;
        $oldZoneCapacity = null; // the old capacity of the zone (used to update a fairs total capacity in case a zones capacity is edited)
        if ($zone) $oldZoneCapacity = entry("zones", ["id" => $zoneid])["capacity"];

        // when editing a fair, fairstartdate has to verified
        // the start date has to be today or later, or, equal to the previously set start date
        if ($fair) { // in order to verify this, when adding a fair:
            array_push($columns, "oldstartdate"); // add the column oldstartdate to the validation columns
            $form["oldstartdate"] = entry("fairs", ["id" => $id])["startdate"]; // and add the old start date to the form
        } // this way validForm can determine if the new start date equals the old start date
        // this "if (startdate == oldstartdate)" check has to be done in validation.php
        // because a valid start date has to be provided in order to validate the end date

        if (validForm($form, $columns)) { // verify and parse the input
            if ($fair) array_pop($columns); // remove oldstartdate, it was only needed for validation
            foreach ($columns as $column) // and update all provided input
                update($table, $column, $form[$column], ["id" => $id]);
        }

        // if clear attachments is checked, remove all old attachments
        if (isset($_POST["clearattachments"]))
            deleteAttachments($subject, $id);

        if ($fair) { // if a fair has been edited, the duration and opening hours might have changed
            $fairData = entry("fairs", ["id" => $id]);
            $fairZones = entries("zones", ["fair" => $id]);
            foreach ($fairZones as $fairZone) {
                $startHour = $fairData["starthour"];
                $endHour = date("H:i", strtotime($fairData["endhour"]) - TIMESLOT_DURATION);
                $startTime = strtotime($fairData["startdate"]."T".$fairData["starthour"]);
                $endTime = strtotime($fairData["enddate"]."T".$endHour.($fairData["starthour"] > $fairData["endhour"] ? " + 1 day" : ""));
                $reservations = entries("reservations", ["zone" => $fairZone["id"]]);
                $cancelledReservations = [];

                foreach ($reservations as $reservation) {
                    $timeslot = $reservation["timeslot"];
                    $cancel = $fairData["starthour"] == $fairData["endhour"]; // the fair has no timeslots anymore
                    $cancel = $cancel || ($timeslot < $startTime || $timeslot > $endTime); // cancel reservations not during the fair duration
                    $timeslot = date("H:i", $timeslot);
                    $cancel = $cancel || ($startHour <= $endHour && ($startHour > $timeslot || $timeslot > $endHour)); // cancel reservations not during the opening hours
                    $cancel = $cancel || ($startHour > $endHour && $startHour > $timeslot && $timeslot > $endHour); // cancel reservations not during the opening hours
                    if ($cancel) array_push($cancelledReservations, $reservation); // the reservation now has an invalid timeslot
                }

                cancelReservations($cancelledReservations, false);
            }
        }

        if ($zone) { // if a zone has been edited, the capacity might have changed
            $timeslots = []; // a list of all timeslots of the zone that have reservations
            $allReservations = entries("reservations", ["zone" => $id]);
            foreach ($allReservations as $reservation)
                array_push($timeslots, $reservation["timeslot"]);
            $timeslots = array_unique($timeslots);
            $zoneData = entry("zones", ["id" => $id]);
            $queuedReservations = [];
            foreach ($timeslots as $timeslot) { // for every timeslot
                $reservations = entries("reservations", ["zone" => $id, "timeslot" => $timeslot, "queued" => false]);
                $reservationCount = reservationCount($id, $timeslot);
                while ($reservationCount > $zoneData["capacity"]) {
                    $reservation = array_pop($reservations);
                    $reservationCount -= $reservation["size"];
                    array_push($queuedReservations, $reservation);
                }
            }
            setReservationsQueued($queuedReservations, true); // queue reservations which now overflow the capacity
            foreach ($timeslots as $timeslot) // for every timeslot
                updateReservationQueue($id, $timeslot); // update the queue (to possibly make new reservations)
            
            updateFairSum($zoneData["fair"], "capacity", $zoneData["capacity"] - $oldZoneCapacity); // and update the fairs total capacity
        }

        $reservatedUsers = [entry("fairs", ["id" => $fairid])["organizer"]]; // a list of all users which have a reservation for the fair/zone (and the organizer)
        $zoneids = []; // a list of all zones which were edited (all zones part of the edited fair or simply the zone that was edited)
        if ($zone) array_push($zoneids, $id);
        if ($fair) {
            $fairZones = entries("zones", ["fair" => $id]);
            foreach ($fairZones as $fairZone)
                array_push($zoneids, $fairZone["id"]);
        }

        for ($i = 0; $i < count($zoneids); ++$i) {
            $reservations = entries("reservations", ["zone" => $zoneids[$i]]);
            foreach ($reservations as $reservation)
                array_push($reservatedUsers, $reservation["visitor"]);
        }

        sendNotifications("edited", ["subject" => $subject, "subjectid" => $id], array_unique($reservatedUsers)); // notify all interested users about the edit
    }

    if ($delete) { // if the action is to delete an existing fair or zone
        $organizer = $fair ? entry("fairs", ["id" => $id])["organizer"] : "";
        if ($fair) deleteFair($id);
        if ($zone) deleteZone($id);
        $profile = isset($_GET["redirect"]) && $_GET["redirect"] == "profile"; // whether to redirect back to the profile page
        redirect($zone ? FAIR_PAGE.$fairid : ($profile ? PROFILE_PAGE.$organizer : HOME_PAGE));
    }

    // upload new attachments
    if (isset($_FILES["attachments"]))
        uploadAttachments($_FILES["attachments"], $subject, $id);
    
    // redirect back to the provided page
    $redirect = isset($_POST["redirect"]) ? $_POST["redirect"] : HOME_PAGE;
    if ($create && $fair && in_array($redirect, [FAIR_PAGE, CREATE_ZONE_PAGE])) $redirect .= $fairid; // add the fair id in case its needed and was just now created
    if ($create && $zone && $redirect == ZONE_PAGE) $redirect .= $zoneid; // add the zone id in case its needed and was just now created
    redirect($redirect);
?>
