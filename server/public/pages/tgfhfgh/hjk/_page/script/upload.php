<?php
    /**
     * php script to upload user files to the server
     */

    require_once __DIR__."/global.php";

    /**
     * encodes $string using a hash function, and returns the new encoded string
     */
    function encode($string = null) {
        return hash("sha256", $string);
    }

    /**
     * function to easily create a new directory,
     * does not create the directory if it already exists,
     * creates the directory recursively and with the default permissions
     */
    function createDir($dir) {
        if (is_dir($dir)) return;

        $oldmask = umask(0);
        mkdir($dir, DEFAULT_PERMISSIONS, true);
        umask($oldmask);
    }

    /**
     * function to easily move a file from $file to $target,
     * works on uploaded files and normal files,
     * does not move $file if it does not exist,
     * overrides $target if it does exist,
     * gives the moved file the default permissions
     */
    function moveFile($file, $target) {
        if (!is_file($file)) return;
        if (is_file($target)) unlink($target);

        if (is_uploaded_file($file))
            move_uploaded_file($file, $target);
        else {
            copy($file, $target);
            unlink($file);
        }
        
        chmod($target, DEFAULT_PERMISSIONS);
    }

    /**
     * function to easily remove files and directories,
     * removes files and recursively removes directories,
     * does not remove anything if $target does not exist
     */
    function remove($target) {
        if (is_file($target))
            unlink($target);
        else if (is_dir($target)) {
            $children = scandir($target);
            foreach ($children as $child) {
                if (!in_array($child, [".", ".."]))
                    remove($target.$child);
            }
            rmdir($target);
        }
    }

    /**
     * returns the extension of $fileName
     */
    function extension($fileName) {
        return strtolower(pathinfo(basename($fileName), PATHINFO_EXTENSION));
    }

    /**
     * uploads $file from a $_FILES variable to the servers upload directory
     * returns the file path to the file, empty if the upload failed
     */
    function uploadFile($file = null) {
        $targetDir = UPLOAD_DIR;
        $targetFile = "";
        $time = microtime();
        $id = 0;

        do {
            $targetFile = $targetDir.encode($time.strval($id++));
        } while (is_file(ROOT.$targetFile));
        
        createDir(ROOT.$targetDir);
        moveFile($file["tmp_name"], ROOT.$targetFile);

        return is_file(ROOT.$targetFile) ? $targetFile : "";
    }

    /**
     * upload all $files from a $_FILES multiple variable to the server uplaod directory
     * returns an array containing the filepath to all succesfully uploaded files
     */
    function uploadFiles($files) {
        $filesList = [];
        $filecount = count(array_filter($files["name"]));
        for ($i = 0; $i < $filecount; ++$i) {
            array_push($filesList, []);
            foreach (array_keys($files) as $parameter)
                $filesList[$i][$parameter] = $files[$parameter][$i];
        }

        $uploads = [];
        foreach ($filesList as $file) {
            $uploaded = uploadFile($file);
            if ($uploaded != "")
                array_push($uploads, $uploaded);
        }

        return $uploads;
    }

    /**
     * checks if $avatar is a valid image, if not, returns an empty string,
     * else, crops $avatar so that it is the biggest square contained within the image (centered),
     * uploads the cropped image to the servers upload directory, and returns the file path to the uploaded file
     */
    function uploadAvatar($avatar) {
        // determine the file extension
        $extension = extension($avatar["name"]);
        
        // check if image is valid
        if ($avatar["error"] != UPLOAD_ERR_OK) return "";
        if (!in_array($extension, ["jpg", "jpeg", "png"])) return "";
        if (getimagesize($avatar["tmp_name"]) == false) return "";
        
        // upload the original image
        $uploaded = uploadFile($avatar);
        
        // crop the image
        $image = $extension == "png" ? imagecreatefrompng(ROOT.$uploaded) : imagecreatefromjpeg(ROOT.$uploaded);
        $width = imagesx($image);
        $height = imagesy($image);
        $size = min($width, $height);
        $rect = ["x" => ($width - $size) / 2, "y" => ($height - $size) / 2, "width" => $size, "height" => $size];
        $cropped = imagecrop($image, $rect); // makes image lose transparency on the UHasselt server (not localhost)
        imagedestroy($image);
        
        // and replace the original image with the cropped image
        if ($extension == "png") imagesavealpha($cropped, true);
        $extension == "png" ? imagepng($cropped, ROOT.$uploaded) : imagejpeg($cropped, ROOT.$uploaded);
        return $uploaded;
    }
?>
