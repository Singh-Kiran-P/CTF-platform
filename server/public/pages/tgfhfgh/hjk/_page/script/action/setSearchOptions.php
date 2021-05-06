<?php
    /**
     * script to set the search options for the logged in user
     * parses the search options form and sets the options as a session variable
     * then redirects back to the home page, with the search options applied
     */

    require_once __DIR__."/../global.php";

    /**
     * returns the value of the given field in the form
     */
    function fieldValue($field) {
        global $form;
        $strings = ["searchtext", "openafter", "openbefore", "timeslot", "orderby"];
        $floats = ["distance", "longitude", "latitude"];

        if (in_array($field, $strings)) return preg_replace("/\s+/", " ", $form[$field]);
        if (in_array($field, $floats)) return floatval($form[$field]);
        if ($field == "orderdirection") return $form[$field] == "ascending" ? SORT_ASC : SORT_DESC;
    }

    $form = $_POST;
    $filters = [];

    // all fields to be used
    $fields = ["searchtext", "openafter", "openbefore", "timeslot", "distance", "longitude", "latitude", "orderby", "orderdirection"];
    foreach ($fields as $field) {
        if (isset($form[$field]) && $form[$field] != "") // if the field is provided
            $filters[$field] = fieldValue($field); // add its value to the filters array
    }

    // field values which should be used together
    $groups = ["location" => ["longitude", "latitude"], "order" => ["orderby", "orderdirection"]];
    foreach ($groups as $groupName => $fields) {
        $groupComplete = true;
        foreach ($fields as $field) {
            if (!isset($filters[$field]))
                $groupComplete = false;
        }

        if ($groupComplete) { // if all fields in a group are provided
            foreach ($fields as $field) // create a new entry for the group
                $filters[$groupName][$field] = $filters[$field]; // and fill in the values for the group
        }
    }

    if (!isset($filters["location"])) { // if a location is not provided
        unset($filters["distance"]); // a maximum distance cannot be used
        if ($filters["orderby"] == "distance") { // and ordering by distance is not possible
            $filters["orderby"] = "reservations"; // order by descending reservations instead
            $filters["orderdirection"] = SORT_DESC;
        }
        $filters["order"] = ["orderby" => $filters["orderby"], "orderdirection" => $filters["orderdirection"]]; // update the order value, since it might have changed
    }

    $_SESSION["filters"] = $filters;
    redirect(HOME_PAGE."1");
?>
