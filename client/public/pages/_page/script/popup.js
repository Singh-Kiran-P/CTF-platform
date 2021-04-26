/**
 * script to manage the popup field without reloading the whole page
 * prevents redirecting of links and submission of forms and only reloads what is necessary
 */

window.addEventListener("load", setEventListeners);
window.setInterval(reloadPopup, 1000);

/**
 * prevents the page from reloading when clicking a link (EG: open notifications)
 * by only reloading the profile bar
 */
function clickedLink(e) {
    e.preventDefault(); // prevent link redirect
    var link = e.target;
    while (link.tagName.toLowerCase() != "a") link = link.parentElement;
    reloadPopup(link.href); // reload only the popup field to the new link
}

/**
 * prevents the page from reloading when submitting a form (EG: clear notification)
 * by submitting the form using AJAX and then reloading the profile bar
 */
function submittedForm(e) {
    e.preventDefault(); // prevent form submission
    var button = e.target;
    while (button.tagName.toLowerCase() != "button") button = button.parentElement;
    var form = button;
    while (form.tagName.toLowerCase() != "form") form = form.parentElement;

    if (form.method.toUpperCase() == "POST") {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = update;
        xmlhttp.open("POST", form.action, true);
        var formData = new FormData(form);
        var redirect = formData.has("redirect") ? formData.get("redirect") : window.location.href;
        formData.delete("redirect"); // prevent the AJAX call from redirecting
        formData.append("type", button.name == "type" ? button.value : "");
        xmlhttp.send(formData); // perform the form action

        function update() {
            if (xmlhttp && xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                reloadPopup(redirect); // reload only the popup field once the form action is performed
            }
        }
    }
    else { // if the form submits with get
        var query = (new URLSearchParams(new FormData(form))).toString();
        reloadPopup(form.action + "?" + query); // simply reload the popup field with the submitted action
    }

    var inputFields = form.querySelectorAll("input:not([type=hidden])");
    for (var i = 0; i < inputFields.length; ++i)
        inputFields[i].value = ""; // clear all values inside the form, as it did not get reloaded
}

/**
 * reloads the popup menu as if the page redirects to link
 * if no link is provided, the popup is reloaded for the current page,
 * but does not reload back to the current page in case the link changes during the AJAX call
 */
function reloadPopup(link) {
    var currentPage = link ? null : window.location.href;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = reload;
    xmlhttp.open("POST", "script/ajax/getProfileBar.php", true);
    var formData = new FormData();
    formData.append("link", link ? link : currentPage); // get the popup field for the given link
    xmlhttp.send(formData);

    function reload() {
        if (xmlhttp && xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (currentPage && currentPage != window.location.href) return; // dont update the profile bar as the link has changed during the AJAX call
            var updated = (new DOMParser()).parseFromString(xmlhttp.responseText, "text/html");
            updatePopupElement(document.getElementById("profileBarContainer"), updated.getElementById("profileBarContainer")); // reload the popup field
            if (link) window.history.replaceState(null, "", link); // change the link, so that the popup menu stays the same on reload
            setEventListeners(); // reset the event listeners because the original elements have been replaced
        }
    }
}

/**
 * updates the current popup element to display the updated popup element
 * this will fail to update text and comments inside an element if the element also contains other children
 * this is however never the case for any element within profileBarContainer
 */
function updatePopupElement(current, updated) {
    if (!(current && updated) || current.outerHTML == updated.outerHTML) return; // elements dont exist/are the same
    var currentTag = current.outerHTML.slice(0, current.outerHTML.indexOf(current.innerHTML));
    var updatedTag = updated.outerHTML.slice(0, updated.outerHTML.indexOf(updated.innerHTML));
    if (current.childElementCount == 0 || currentTag != updatedTag) { // if the current element has no children, or their tags are different
        if (!(current.tagName.toLowerCase() == "textarea" && updated.tagName.toLowerCase() == "textarea")) // do not update textareas, to allow them to resize
            current.replaceWith(updated.cloneNode(true)); // fully replace the current element
    }
    else if (current.childElementCount != updated.childElementCount) { // else, if the current element has children to be added/removed
        for (var i = 0; i < updated.childElementCount; ++i) {
            var updatedChild = updated.children[i].cloneNode(true);
            if (i >= current.childElementCount || current.children[i].outerHTML != updatedChild.outerHTML)
                i == 0 || i >= current.childElementCount ? current.prepend(updatedChild) : current.children[i - 1].after(updatedChild); // add new children
        }
        while (updated.childElementCount < current.childElementCount)
            current.removeChild(current.lastElementChild); // remove extra children
    }
    else { // else, the difference is not in the current element, but in one of its children
        for (var i = 0; i < current.childElementCount; ++i)
            updatePopupElement(current.children[i], updated.children[i]); // update all the children recursively
    }
}

/**
 * sets the event listeners for clicking links or submitting forms
 */
function setEventListeners() {
    var links = document.querySelectorAll("#popupField a.nostyle:not(.profile), #notificationButton, #messageButton");
    for (var i = 0; i < links.length; ++i)
        links[i].addEventListener("click", clickedLink, false);

    var forms = document.querySelectorAll("#popupField form");
    for (var i = 0; i < forms.length; ++i) {
        var buttons = forms[i].querySelectorAll("button[type=submit]");
        for (var j = 0; j < buttons.length; ++j)
            buttons[j].addEventListener("click", submittedForm, false);
    }
}
