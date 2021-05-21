<?php
    /**
     * global php script included in all other php files
     * defines constants and general functions
     * initializes the user session
     */

    require_once __DIR__."/../root.php";

    // database login information
    define("DB_HOST", "localhost");
    define("DB_NAME", "landermoors");
    define("DB_USER", "landermoors");
    define("DB_PASSWORD", "Oot2eequ");
    define("DB_TYPE", $_SERVER["SERVER_NAME"] == "localhost" ? "mysql" : "pgsql");

    // constants for ease of use
    define("MAX_DAYS", 14);
    define("PAGE_SIZE", 10);
    define("MAX_RATING", 5);
    define("TIMESLOT_DURATION", 3600);
    define("DEFAULT_PERMISSIONS", 0777);
    define("VISITOR", "visitor");
    define("ORGANIZER", "organizer");
    define("ADMIN", "admin");

    // default information for new accounts
    define("DEFAULT_AVATAR", "images/avatar.png");
    define("DEFAULT_DESCRIPTION", "");

    // directories and pages
    define("PROJECT_URL", projectURL());
    define("UPLOAD_DIR", "images/upload/");
    define("LOGIN_PAGE", "login.html");
    define("REGISTER_PAGE", "register.html");
    define("HOME_PAGE", "home.php?page=");
    define("PROFILE_PAGE", "profile.php?mode=view&user=");
    define("EDIT_PROFILE_PAGE", "profile.php?mode=edit&user=");
    define("FAIR_PAGE", "subject.php?subject=fair&mode=view&fair=");
    define("ZONE_PAGE", "subject.php?subject=zone&mode=view&zone=");
    define("CREATE_FAIR_PAGE", "subject.php?subject=fair&mode=create");
    define("EDIT_FAIR_PAGE", "subject.php?subject=fair&mode=edit&fair=");
    define("CREATE_ZONE_PAGE", "subject.php?subject=zone&mode=create&fair=");
    define("EDIT_ZONE_PAGE", "subject.php?subject=zone&mode=edit&zone=");
    define("DELETE_FAIR_PAGE", "subject.php?subject=fair&mode=delete&fair=");
    define("DELETE_ZONE_PAGE", "subject.php?subject=zone&mode=delete&zone=");
    define("DELETE_FAIR", "script/action/editSubject.php?subject=fair&mode=delete&fair=");
    define("DELETE_ZONE", "script/action/editSubject.php?subject=zone&mode=delete&zone=");
      
    /**
     * returns the url to be appended after the domain name to get to the project root directory,
     * EG: in localhost this is "/source", on the UHasselt server this is "/~landermoors/project/source",
     * used to properly redirect to pages relative to the root directory
     */
    function projectURL($fileDirUrl = null, $fileDirPath = null) {
        if (!isset($fileDirUrl)) $fileDirUrl = dirname($_SERVER["REQUEST_URI"]."."); // starting url, the url of the file this function is called from
        if (!isset($fileDirPath)) $fileDirPath = realpath(dirname($_SERVER["SCRIPT_FILENAME"].".")); // starting file path, the file path of the file this function is called from
        if (strpos(realpath(ROOT), $fileDirPath) === 0) { // if the file path equals or is fully part of the file root directory (the directory containing root.php)
            if (strlen($fileDirUrl) == 1) $fileDirUrl = ""; // the url will too
            return str_replace("\\", "/", $fileDirUrl.substr(realpath(ROOT), strlen($fileDirPath))); // and the root project url can be returned
        }
        return projectURL(dirname($fileDirUrl), dirname($fileDirPath)); // otherwise, recursively search with the parent of both the url and the file path
    }

    /**
     * redirect the browser to $page, defaults to HOME_PAGE
     */
    function redirect($page = HOME_PAGE) {
        header("Location: ".PROJECT_URL."/".$page);
        die();
    }
    
    /**
     *  log a user in by saving their username in the session
     */
    function login($username) {
        $_SESSION["username"] = $username;
    }
    
    /**
     * log a user out by clearing the session variables
     */
    function logout() {
        session_unset();
    }
    
    /**
     * start the user session
     */
    function initSession() {
        session_set_cookie_params(["lifetime" => 60 * 60 * 24 * 365]); // keep the session on browser close (for a year)
        session_start();
    }

    initSession(); // initialize the session
?>
