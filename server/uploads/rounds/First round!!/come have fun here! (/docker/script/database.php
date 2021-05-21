<?php
    /**
     * php script to connect to the database and provide functions for often used queries
     */

    require_once __DIR__."/upload.php";

    /**
     * returns a connection to the database
     */
    function db_conn() : PDO {
        static $db_conn = null; // static variable, so we dont have to reconnect each time

        if (!isset($db_conn)) { // if not yet connected
            try {
                $db_conn = new PDO(DB_TYPE.":host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASSWORD); // connect
            } catch (PDOException $e) {
                print("Error creating database connection: ".$e->getMessage()."\n");
                die();
            }
        }

        return $db_conn; // return the database connection
    }

    /**
     * returns the value used in the database for $value in $column
     * EG: if $column == "password" returns the hashed password
     */
    function db_val($column, $value) {
        if ($column == "password") return encode($value);
        return $value;
    }

    /**
     * returns the size of reservations placed for the given zone at the given timeslot
     * does not count queued reservations
     */
    function reservationCount($zoneid, $timeslot) {
        $reservationCount = 0;
        $reservations = entries("reservations", ["zone" => $zoneid, "timeslot" => $timeslot, "queued" => false]);
        foreach ($reservations as $reservation)
            $reservationCount += $reservation["size"];
        return $reservationCount;
    }

    /**
     * returns userdata from the provided user, excluding their password
     * returns an empty array if the user does not exist
     */
    function userdata($username) {
        $userdata = entry("users", ["username" => $username]); // get the user entry
        if (empty($userdata)) return []; // if the user does not exist, return an empty array
        unset($userdata["password"]); // else, remove the password
        return $userdata; // and return the userdata
    }

    /**
     * updates a users username from $oldUsername to $newUsername, also updates any foreign keys in the database
     */
    function updateUsername($oldUsername, $newUsername) {
        remove(ROOT.UPLOAD_DIR."/".encode(strtolower($oldUsername))); // remove the users old temporary file
        update("users", "username", $newUsername, ["username" => $oldUsername]);
        $foreignKeys = ["fairs" => "organizer", "reservations" => "visitor"];
        foreach ($foreignKeys as $table => $column)
            update($table, $column, $newUsername, [$column => $oldUsername]);
    }

    /**
     * delete a user from the database, along with all data associated with them,
     * uploaded files, created fairs, made reservations, ...
     */
    function deleteUser($username) {
        $avatar = userdata($username)["avatar"];
        if ($avatar != DEFAULT_AVATAR) remove(ROOT.$avatar);
        remove(ROOT.UPLOAD_DIR."/".encode(strtolower($username)));
        deleteFrom("users", ["username" => $username]);
        $fairs = entries("fairs", ["organizer" => $username]);
        foreach ($fairs as $fair) deleteFair($fair["id"]);
        cancelReservations(entries("reservations", ["visitor" => $username]));
        deleteFrom("notifications", ["receiver" => $username]);
        deleteFrom("messages", [["LOWER(sender) = :username OR LOWER(receiver) = :username", ["username" => strtolower($username)]]]);
    }

    /**
     * a fair has the sum of all its zones capcity's and reservations stored in its database
     * these are stored in the database in order to drastically speed up searching for fairs
     * as the fair capacity and reservations need to be calculated for every single fair, in order to sort by capacity or reservations,
     * and recalculating the capacity and reservations for every fair on every search is very expensive
     * therefore, by storing the total capacity and reservations in the database, searches are way faster
     * this function updates the $sum for $fairid by adding $add to the previous value
     */
    function updateFairSum($fairid, $sum, $add) {
        $fair = entry("fairs", ["id" => $fairid]);
        update("fairs", $sum, (empty($fair) ? 0 : $fair[$sum]) + $add, ["id" => $fairid]);
    }

    /**
     * delete a fair from the database, along with all its zones and attachments
     */
    function deleteFair($fairid) {
        sendNotification("deleted", ["subject" => "fair", "subjectid" => $fairid], entry("fairs", ["id" => $fairid])["organizer"]);
        $zones = entries("zones", ["fair" => $fairid]);
        foreach ($zones as $zone) deleteZone($zone["id"], false);
        deleteFrom("fairs", ["id" => $fairid]);
        deleteFrom("notifications", [["header LIKE :link OR body LIKE :link", ["link" => "%".FAIR_PAGE.$fairid."%"]]]); // remove all notifications with a link to the deleted fair
        deleteAttachments("fair", $fairid);
    }

    /**
     * delete a zone from the database, along with all its reservations and attachments
     */
    function deleteZone($zoneid, $notifyOrganizer = true) {
        $zone = entry("zones", ["id" => $zoneid]);
        $reservatedUsers = [];
        $reservations = entries("reservations", ["zone" => $zoneid]);
        foreach ($reservations as $reservation) array_push($reservatedUsers, $reservation["visitor"]);
        if ($notifyOrganizer) array_push($reservatedUsers, entry("fairs", ["id" => $zone["fair"]])["organizer"]);
        sendNotifications("deleted", ["subject" => "zone", "subjectid" => $zoneid], array_unique($reservatedUsers));
        updateFairSum($zone["fair"], "reservations", -count($reservations));
        updateFairSum($zone["fair"], "capacity", -$zone["capacity"]);
        deleteFrom("zones", ["id" => $zoneid]);
        deleteFrom("reservations", ["zone" => $zoneid]);
        deleteFrom("notifications", [["header LIKE :link OR body LIKE :link", ["link" => "%".ZONE_PAGE.$zoneid."%"]]]); // remove all notifications with a link to the deleted zone
        deleteAttachments("zone", $zoneid);
    }

    /**
     * cancel the given reservation, and update the queued reservations for the zone and timeslot
     */
    function cancelReservation($reservation) {
        cancelReservations([$reservation]);
    }

    /**
     * cancel the given reservations, and update the queued reservations for the zones and timeslots
     */
    function cancelReservations($reservations, $updateReservationQueue = true) {
        $zones = [];
        foreach ($reservations as $reservation) {
            if (!isset($zones[$reservation["zone"]]))
                $zones[$reservation["zone"]] = [$reservation["visitor"]];
            else array_push($zones[$reservation["zone"]], $reservation["visitor"]);
        }

        $fairs = [];
        foreach ($zones as $zone => $visitors) {
            sendNotifications("cancelled", ["subject" => "zone", "subjectid" => $zone], $visitors);
            $fair = entry("zones", ["id" => $zone])["fair"];
            if (!isset($fairs[$fair]))
                $fairs[$fair] = $visitors;
            else $fairs[$fair] = array_merge($fairs[$fair], $visitors);
        }
        
        foreach ($fairs as $fair => $cancelledReservations)
            updateFairSum($fair, "reservations", -count($cancelledReservations));
        deleteFrom("reservations", [idListParamaterQuery($reservations)]);
        if ($updateReservationQueue) {
            $reservations = array_unique($reservations);
            foreach ($reservations as $reservation)
                updateReservationQueue($reservation["zone"], $reservation["timeslot"]);
        }
    }

    /**
     * update the queued status for the given reservation to $queued
     */
    function setReservationQueued($reservation, $queued) {
        setReservationsQueued([$reservation], $queued);
    }

    /**
     * update the queued status for the given reservations to $queued
     */
    function setReservationsQueued($reservations, $queued) {
        $zones = [];
        foreach ($reservations as $reservation) {
            if (!isset($zones[$reservation["zone"]]))
                $zones[$reservation["zone"]] = [$reservation["visitor"]];
            else array_push($zones[$reservation["zone"]], $reservation["visitor"]);
        }

        foreach ($zones as $zone => $visitors)
            sendNotifications($queued ? "queued" : "made", ["subject" => "zone", "subjectid" => $zone], $visitors);
        update("reservations", "queued", $queued, [idListParamaterQuery($reservations)]);
    }

    /**
     * returns the given list of items with an id as a paramaterQuery for id in list
     * EG: idListQuery([["id" => 3], ["id" => 9], ["id" => 1], ["id" => 5]])
     * RETURNS: ["id IN (3, 9, 1, 5, -1)"] (-1 is added to prevent empty lists, an id can never be -1)
     */
    function idListParamaterQuery($list) {
        $query = "id IN (";
        foreach ($list as $item)
            $query .= intval($item["id"]).", ";
        return [$query."-1)"];
    }

    /**
     * updates the queue for $timeslot in $zoneid by making queued reservations if they fit in the zone capacity
     */
    function updateReservationQueue($zoneid, $timeslot) {
        $remainingCapacity = entry("zones", ["id" => $zoneid])["capacity"] - reservationCount($zoneid, $timeslot);
        $queue = entries("reservations", ["zone" => $zoneid, "timeslot" => $timeslot, "queued" => true]);
        $madeReservations = [];
        foreach ($queue as $reservation) { // for every queued reservation
            if ($remainingCapacity >= $reservation["size"]) { // if it fits in the zone capacity
                $remainingCapacity -= $reservation["size"];
                array_push($madeReservations, $reservation);
            }
        }

        setReservationsQueued($madeReservations, false);
    }

    /**
     * send a notifcation of $type with $parameters to $user
     */
    function sendNotification($type, $parameters, $user) {
        sendNotifications($type, $parameters, [$user]);
    }

    /**
     * send notifcations of $type with $parameters to all $users
     * $parameters is an associative array with expected values based on $type
     * the valid types (followed by their expected parameters) are:
     * - custom: header, body
     * - showReview: review, rating, zoneid
     * - edited, deleted, queued, made, requestreview: subject, subjectid
     * does not send the notification in case the receiver is the logged in user
     */
    function sendNotifications($type, $parameters, $users) {
        $header = "";
        $body = "";
        $subject = isset($parameters["subject"]) ? $parameters["subject"] : null;
        $subjectid = isset($parameters["subjectid"]) ? $parameters["subjectid"] : null;

        switch ($type) {
            case "custom":
                $header = $parameters["header"];
                $body = $parameters["body"];
                break;
            case "showreview":
                $header = "You received a review for ".href("zone", $parameters["zoneid"]);
                $body = "- ".href("profile", $_SESSION["username"]);
                break;
            case "edited":
                $header = href($subject, $subjectid, false)." has been edited";
                $body = "Be sure to check ".href($subject, $subjectid)." for any possible changes";
                break;
            case "deleted":
                $header = href($subject, $subjectid, false)." has been deleted";
                $body = "All reservations for this ".$subject." have been cancelled";
                break;
            case "requestreview":
                $header = "Submit a review for ".href($subject, $subjectid, false)."!";
                $body = "Your reservation for ".href($subject, $subjectid)." has ended, you can submit a review below!";
                break;
            case "queued":
                $header = "Your reservation has been queued";
                $body = "One of your reservations for ".href($subject, $subjectid)." is now queued and no longer valid";
                break;
            case "made":
                $header = "Your queued reservation has been made";
                $body = "One of your queued reservations for ".href($subject, $subjectid)." is now made as a valid reservation";
                break;
            case "cancelled":
                $header = "Your reservation has been cancelled";
                $body = "One of your reservations for ".href($subject, $subjectid)." has been cancelled";
                break;
        }

        $notifications = [];
        $review = isset($parameters["review"]) ? $parameters["review"] : "";
        $rating = isset($parameters["rating"]) ? $parameters["rating"] : 0;
        $reviewZone = $type == "requestreview" ? $subjectid : -1;
        $timestamp = time();

        foreach ($users as $user) {
            if (!in_array($type, ["custom", "showreview", "requestreview"]) && isset($_SESSION["username"]) && strcasecmp($_SESSION["username"], $user) == 0)
                continue; // dont send users a notification about their own actions
            array_push($notifications, [
                "receiver" => $user,
                "header" => $header,
                "body" => $body,
                "review" => $review,
                "rating" => $rating,
                "reviewzone" => $reviewZone,
                "timestamp" => $timestamp,
                "state" => "unread"
            ]);
        }

        insertMultiple("notifications", $notifications);
    }

    /**
     * returns an link string to the given subject: (text between | represents a link to the relevant element)
     * $subject == "fair" => |fairName|
     * $subject == "zone" => |fairName|'s |zone|
     * $subject == "profile" => |profileName|
     * if $linked is false the text is simply returned without links
     */
    function href($subject, $subjectid, $linked = true) {
        $href = $subject == "zone" ? href("fair", entry("zones", ["id" => $subjectid])["fair"], $linked)."'s " : "";
        if ($linked) $href .= '<a href="'.($subject == "fair" ? FAIR_PAGE : ($subject == "zone" ? ZONE_PAGE : PROFILE_PAGE)).$subjectid.'">';
        $href .= $subject == "profile" ? entry("users", ["username" => $subjectid])["username"] : entry($subject."s", ["id" => $subjectid])["name"];
        if ($linked) $href .= "</a>";
        return $href;
    }

    /**
     * uploads all files in $attachments to the servers upload folder
     * stores them in the "attachments" table in the database for $subject with $subjectid
     * $subject can either be "fair" or "zone", depending on which the attachments are for
     */
    function uploadAttachments($attachments, $subject, $subjectid) {
        $uploads = uploadFiles($attachments);
        for ($i = 0; $i < count($uploads); ++$i) {
            $extension = extension($attachments["name"][$i]);
            if (in_array($extension, ["png", "jpg", "jpeg", "mp4"]))
                insert("attachments", [
                    "subject" => $subject,
                    "subjectid" => $subjectid,
                    "filename" => $uploads[$i],
                    "extension" => $extension
                ]);
        }
    }

    /**
     * delete all attachments for $subject with $subjectid
     * delete attachments from both the database and the server
     * $subject can either be "fair" or "zone"
     */
    function deleteAttachments($subject, $subjectid) {
        $parameters = ["subject" => $subject, "subjectid" => $subjectid];
        $attachments = entries("attachments", $parameters);
        deleteFrom("attachments", $parameters);
        foreach ($attachments as $attachment)
            remove(ROOT.$attachment["filename"]);
    }

    /**
     * given a table, update the given column to the given value for all rows that match $parameters
     */
    function update($table, $column, $value, $parameters) {
        $update = parameterQuery("UPDATE ".$table." SET ".$column."=:value", $parameters);
        $update->bindValue(":value", db_val($column, $value), dataType($value));
        if (!$update->execute()) die();
    }

    /**
     * given a table, delete all rows in the database that match the table
     */
    function deleteFrom($table, $parameters) {
        $delete = parameterQuery("DELETE FROM ".$table, $parameters);
        if (!$delete->execute()) die();
    }

    /**
     * orders and returns the given list containing associative arrays
     * sorts by $key by the order defined with $sort (ascending by default)
     */
    function orderBy($list ,$key, $sort = SORT_ASC) {
        $keys = array_column($list, $key);
        array_multisort($keys, $sort, $list);
        return $list;
    }

    /**
     * given a table, returns if there is a row that matches all parameters (column => value)
     */
    function exists($table, $parameters) {
        return count(entries($table, $parameters)) > 0;
    }

    /**
     * given a table, returns the only row that matches all parameters
     * returns an empty array if none or multiple rows match
     */
    function entry($table, $parameters) {
        $entries = entries($table, $parameters);
        if (count($entries) != 1) return [];
        return $entries[0];
    }

    /**
     * given a table, return all rows that match all parameters (column => value)
     */
    function entries($table, $parameters) {
        $selection = parameterQuery("SELECT * FROM ".$table, $parameters); // create the parameter query
        if ($selection->execute()) { // execute the finished query
            $entries = [];
            while ($row = $selection->fetch(PDO::FETCH_NAMED))
                array_push($entries, $row); // store all entries in an array
            return $entries; // return the entries
        }
        else die(); // if the query execution failed
    }

    /**
     * given a table, insert the $parameters (column => value) into the database
     */
    function insert($table, $parameters) {
        insertMultiple($table, [$parameters]);
    }

    /**
     * given a table, inserts the list of paramaters (column => value) into the database in a single query
     */
    function insertMultiple($table, $parametersList) {
        if (empty($parametersList)) return;
        $query = "INSERT INTO ".$table."("; // create the query
        $columns = array_keys($parametersList[0]);
        foreach($columns as $column) {
            $query .= $column; // add the columns
            if ($column != end($columns))
                $query .= ", ";
        }
        $query .= ") VALUES";
        for ($i = 0; $i < count($parametersList); ++$i) { // for every entry
            $query .= " (";
            foreach($columns as $column) {
                $query .= ":".$column.$i; // add the values
                if ($column != end($columns))
                    $query .= ", ";
            }
            $query .= ")";
            if ($i != count($parametersList) - 1)
                $query .= ",";
        }
        $query .= ";";

        $insert = db_conn()->prepare($query);
        for ($i = 0; $i < count($parametersList); ++$i) { // for every entry
            foreach($parametersList[$i] as $column => $value)
                $insert->bindValue(":".$column.$i, db_val($column, $value), dataType($value)); // bind the values
        }

        if (!$insert->execute()) die(); // execute the query to insert into the database
    }

    /**
     * returns an executable query with $parameters filled in to the WHERE clause
     * $parameters is a list containing elements which represent comparison operators
     * each of these elements is turned into the corresponding SQL comparison string,
     * using value binding and lowercase comparison for string
     * there are 3 types of valid elements:
     * [$column => $value]: "column = value"
     * [$column => [$operator, $value]]: "column OPERATOR value"
     * [$int => [$string, [$nameA => $valueA, ...]]]: "string" with each $name binding their value into the string
     * 
     * EG: parameterQuery("SELECT * FROM table", ["columnA" => "valueA", "columnB" => "valueB"])
     * RETURNS: "SELECT * FROM table WHERE LOWER(columnA) = LOWER('valueA') AND LOWER(columnB) = LOWER('valueB') AND 1=1;" as an exectuable query
     * 
     * EG: parameterQuery("DELETE FROM table", ["columnA" => "10", "columnB" => ["LIKE", "valueB"], "columnC" => 0])
     * RETURNS: "DELETE FROM table WHERE columnA = 10 AND LOWER(columnB) LIKE LOWER('valueB') AND columnC = 10 AND 1=1;" as an exectuable query
     * 
     * EG: parameterQuery("UPDATE table SET columnA=0", ["columnA" => [">=", 0], ["columnB = :valueB OR columnC = :valueC", [":valueB" => 0, ":valueC" => "valueC"]], "columnD" => ["<>", 0]])
     * RETURNS: "UPDATE table SET columnA=0 WHERE columnA >= 0 AND (columnB = 0 OR columnC = 'valueC') AND columnD <> 0;" as an executable query
     */
    function parameterQuery($query, $parameters) {
        $query .= " WHERE "; // sql query text
        foreach ($parameters as $column => $value) { // for every parameter
            if (is_numeric($column)) { // if the parameter is a string
                $query .= "(".$value[0].")"; // add the string to the query
                if (count($value) > 1) {
                    foreach ($value[1] as $col => $val) // add all name => value pairs to $parameters
                        $parameters[$col] = $val; // as all parameters will be binded to their value
                }
                unset($parameters[$column]); // and remove the original parameter, as this would otherwise also be binded
            }
            else { // if the paramater is a column value pair
                $comparisonOperator = "="; // default comparison operator
                if (is_array($value)) { // if a different comparison operator has been supllied
                    $comparisonOperator = $value[0]; // use the different comparison operator
                    $value = $value[1];
                    $parameters[$column] = $value;
                }
                if (gettype($value) != "string") $query .= $column." ".$comparisonOperator." :".$column; // check if the column equals the value
                else $query .= "LOWER(".$column.") ".$comparisonOperator." LOWER(:".$column.")"; // case insensitive for strings
            }
            
            $query .= " AND ";
        }
        $query .= "1=1;"; // to deal with the final AND / no parameters provided (is always true)

        $executable = db_conn()->prepare($query); // create the executable query
        foreach ($parameters as $column => $value) // for every parameter
            $executable->bindValue(":".$column, db_val($column, $value), dataType($value)); // bind the value

        return $executable;
    }

    /**
     * returns the PDO data type for the given value
     */
    function dataType($value) {
        if (is_null($value)) return PDO::PARAM_NULL;
        if (is_bool($value)) return PDO::PARAM_BOOL;
        if (is_int($value)) return PDO::PARAM_INT;
        return PDO::PARAM_STR;
    }
?>
