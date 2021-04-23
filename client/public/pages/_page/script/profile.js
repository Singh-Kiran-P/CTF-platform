/**
 * script for the profile page
 * manages the opening and closing of form sections
 * updates the edit profile avatar picture 
 */

var editProfileForm;
var sections;
var editProfileAvatarInput;
var editProfileAvatarImage;

window.addEventListener("load", function () {
    editProfileForm = document.querySelector("#profilePage form");
    sections = document.querySelectorAll("form > section");
    editProfileAvatarInput = document.getElementById("editProfileAvatarInput");
    editProfileAvatarImage = document.getElementById("editProfileAvatarImage");

    if (editProfileAvatarInput) editProfileAvatarInput.addEventListener("change", editProfileAvatarUpdated, false);
    for (var i = 0; i < sections.length; ++i) {
        var header = sections[i].querySelector("header");
        if (header) header.addEventListener("click", toggleSection, false);
    }
});

/**
 * opens a closed section and closes an open section,
 * clears all input when closing a section,
 * the section is determined using the events target
 */
function toggleSection(e) {
    var section = e.target;
    while (section.tagName.toLowerCase() != "section") section = section.parentElement;
    if (section.classList.contains("closed"))
        section.classList.remove("closed");
    else {
        section.classList.add("closed");
        
        // clear all input in a closed section
        var inputFields = section.querySelectorAll("input[type=text], input[type=password]");
        for (var i = 0; i < inputFields.length; ++i)
            inputFields[i].value = "";
    }
}

/**
 * called when the user uploads an image to edit profile avatar,
 * updates the preview of the avatar with an AJAX call that takes the uploaded image,
 * validates it, crops it (so that it is square), stores it on the server
 * and returns the file path to it (empty in case of an invalid file),
 * see script/ajax/getAvatar.php for why this is not done client side
 */
function editProfileAvatarUpdated() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = updateAvatar;
    xmlhttp.open("POST", "script/ajax/getAvatar.php", true);
    xmlhttp.send(new FormData(editProfileForm));

    function updateAvatar() {
        if (xmlhttp && xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (xmlhttp.responseText == "") // error uploading the new avatar
                return; // keep showing the old avatar
            
            // add the time to the url so the image will also reload in case the new file has the same file name
            var src = xmlhttp.responseText + "?t=" + (new Date()).getTime();
            editProfileAvatarImage.src = src;
        }
    }
}
