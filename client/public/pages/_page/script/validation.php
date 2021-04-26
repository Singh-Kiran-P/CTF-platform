<?php
    /**
     * php script to validate and parse user input and provide error messages
     */

    require_once __DIR__."/database.php";

    /**
     * returns if the value of all $inputNames in the form is provided and valid,
     * and formats the input form:
     * removes trailing and leading whitespace from the values,
     * parses values, EG: "longitude" into a float or "startdate" into a valid date, 
     * removes any inputField not provided with $inputNames
     */
    function validForm(&$form, $inputNames) {
        foreach (array_keys($form) as $inputName) {
            if (!in_array($inputName, $inputNames))
                unset($form[$inputName]); // remove inputField if it is not provided in inputNames
        }

        $validation = formValidation($form); // get form validation

        foreach ($inputNames as $inputName) {
            if (!isset($validation[$inputName]))
                return false; // inputName is not provided
            if ($validation[$inputName] != "")
                return false; // inputName is an invalid field
        }

        return true; // all inputNames are valid and provided fields
    }

    /**
     * returns a validation for the given form, a list with every element being (inputName => validationMessage),
     * if a validationMessage is empty the input is valid, otherwise the validationMessage says why it is invalid,
     * formats the input form:
     * removes trailing and leading whitespace from the values,
     * parses values, EG: "longitude" into a float or "startdate" into a valid date, 
     */
    function formValidation(&$form) {
        $validation = [];

        foreach ($form as $inputName => $value) { // for every input variable in the form
            $form[$inputName] = parseValue($inputName, trim($value)); // trim and  parse the value (for inputnames such as longitude or startdate)
            $validation[$inputName] = validationMessage($form, $inputName); // and get its validationMessage
        }

        return $validation;
    }

    /**
     * returns the parsed value of $value for $inputName
     * parses dates into valid dates, hours into valid hours,
     * coordintates into floats and capacity into an integer
     */
    function parseValue($inputName, $value) {
        if (in_array($inputName, ["startdate", "enddate", "oldstartdate"])) return date("Y-m-d", strtotime($value)); // parse date
        if (in_array($inputName, ["starthour", "endhour"])) return date("H:i", strtotime("0-0-0T".$value.":00")); // parse hour
        if (in_array($inputName, ["longitude", "latitude"])) return floatval($value); // parse coordinate
        if ($inputName == "capacity") return intval($value); // parse capacity
        return $value; // no parsing needed
    }

    /**
     * return the validation message for $inputName
     */
    function validationMessage($form, $inputName) {
        if (required($inputName) && strlen($form[$inputName]) == 0) return "Field is required";

        // profile form validation
        if ($inputName == "username") return validateUsername($form[$inputName]);
        if ($inputName == "email") return validateEmail($form[$inputName]);
        if ($inputName == "phoneNumber") return validatePhoneNumber($form[$inputName]);
        if ($inputName == "password") return validatePassword($form[$inputName]);
        if ($inputName == "confirmPassword") return validateConfirmPassword(value($form, "password"), $form[$inputName]);
        if ($inputName == "profileType") return validateProfileType($form[$inputName]);
        if ($inputName == "loginUsername") return validateLoginUsername($form[$inputName]);
        if ($inputName == "loginPassword") return validateLoginPassword(value($form, "loginUsername"), $form[$inputName]);
        if ($inputName == "confirmProfileUsername") return validateConfirmProfileUsername(value($form, "profileUsername"), $form[$inputName]);
        if (in_array($inputName, ["confirmChangeLoginPassword", "confirmDeleteLoginPassword"])) return validateConfirmLoginPassword($form[$inputName]);
        
        // fair and zone form validation
        if ($inputName == "name") return validateName($form[$inputName]);
        if ($inputName == "startdate") return validateStartDate(value($form, "oldstartdate"), $form[$inputName]);
        if ($inputName == "enddate") return validateEndDate(value($form, "startdate"), $form[$inputName]);
        if ($inputName == "starthour") return validateStartHour($form[$inputName]);
        if ($inputName == "endhour") return validateEndHour(value($form, "starthour"), $form[$inputName]);
        if ($inputName == "capacity") return validateCapacity($form[$inputName]);
        if ($inputName == "longitude") return validateLongitude($form[$inputName]);
        if ($inputName == "latitude") return validateLatitude($form[$inputName]);

        return "";
    }

    /**
     * returns the value of $inputName in $form, null if not set
     */
    function value($form, $inputName) {
        return isset($form[$inputName]) ? $form[$inputName] : null;
    }

    /**
     * returns if $inputName is a required field
     */
    function required($inputName) {
        $notRequired = ["confirmPassword", "description", "phoneNumber"];
        return !in_array($inputName, $notRequired);
    }

    function validateUsername($username) {
        if (strlen($username) < 3) return "Must be at least 3 characters";
        if (strlen($username) > 32) return "Must be at most 32 characters";
        if (!preg_match("/^[a-zA-Z-' ]*$/", $username)) return "Must be only letters and spaces";
        if (exists("users", ["username" => $username])) return "Username is already registered";
        return "";
    }

    function validateEmail($email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return "Invalid email format";
        if (exists("users", ["email" => $email])) return "Email is already registered";
        return "";
    }

    function validatePhoneNumber($phoneNumber) {
        if ($phoneNumber == "") return ""; // a phone number is not required
        if (!preg_match("/^[0-9]*$/", $phoneNumber)) return "Must be only numbers";
        if (strlen($phoneNumber) < 8) return "Must be at least 8 numbers";
        if (exists("users", ["phoneNumber" => $phoneNumber])) return "Phone number is already registered";
        return "";
    }

    function validatePassword($password) {
        if (strlen($password) < 6) return "Must be at least 6 characters";
        if (!preg_match("/^.*[0-9]+.*$/", $password) || !preg_match("/^.*[a-zA-Z]+.*$/", $password)) return "Must contain both letters and numbers";
        return "";
    }

    function validateConfirmPassword($password, $confirmPassword) {
        if (!isset($password)) return "Password not provided";
        if (validatePassword($password) != "") return ""; // no need to give confirm password an error, as password already has one
        if ($password != $confirmPassword) return "Passwords don't match";
        return "";
    }

    function validateProfileType($profileType) {
        if (!in_array($profileType, [ORGANIZER, VISITOR])) return "Invalid profile type";
        return "";
    }

    function validateLoginUsername($loginUsername) {
        if (!exists("users", ["username" => $loginUsername])) return "User does not exist";
        return "";
    }

    function validateLoginPassword($loginUsername, $loginPassword) {
        if (!isset($loginUsername)) return "Login username not provided";
        if (validateLoginUsername($loginUsername) != "") return ""; // no need to give login password an error, as login username already has one
        if (!exists("users", ["username" => $loginUsername, "password" => $loginPassword])) return "Incorrect password";
        return "";
    }

    function validateConfirmProfileUsername($profileUsername, $confirmProfileUsername) {
        if (!isset($profileUsername)) return "Profile username not provided";
        if (strcasecmp($profileUsername, $confirmProfileUsername) != 0) return "Incorrect username";
        return "";
    }

    function validateConfirmLoginPassword($confirmLoginPassword) {
        if (!isset($_SESSION["username"])) return "No logged in user";
        if (!exists("users", ["username" => $_SESSION["username"], "password" => $confirmLoginPassword])) return "Incorrect password";
        return "";
    }

    function validateName($name) {
        if (strlen($name) < 3) return "Name must be at least 3 characters";
        return "";
    }

    function validateStartDate($oldStartDate, $startDate) {
        if (isset($oldStartDate) && $oldStartDate == $startDate) return ""; // start date can be in the past if it is equal to the old start date
        if (strtotime($startDate) <= strtotime(date("Y-m-d"))) return "New start date must be at least tomorrow";
        return "";
    }

    function validateEndDate($startDate, $endDate) {
        if (!isset($startDate)) return "Start date not provided";
        if (strtotime($endDate) < strtotime($startDate)) return "End date can't be before start date";
        $startDateTime = new DateTime($startDate);
        $endDateTime = new DateTime($endDate);
        if ($startDateTime->diff($endDateTime)->y >= 1) return "Fair cannot last longer than a year";
        return "";
    }

    function validateStartHour($startHour) {
        return ""; // no validation needed
    }

    function validateEndHour($startHour, $endHour) {
        if (!isset($startHour)) return "Start hour not provided";
        return ""; // no validation needed
    }

    function validateCapacity($capacity) {
        if ($capacity < 1) return "Capacity must be at least 1";
        if ($capacity >= 1000) return "Capacity must be lower than 1000";
        return "";
    }

    function validateLongitude($longitude) {
        if (abs($longitude) > 180) return "Longitude must be between -180 and 180 degrees";
        return "";
    }

    function validateLatitude($latitude) {
        if (abs($latitude) > 90) return "Latitude must be betwen -90 and 90 degrees";
        return "";
    }
?>
