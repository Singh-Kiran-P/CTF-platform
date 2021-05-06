/**
 * script for accessibility.php
 * toggles the content for the headers
 */

window.addEventListener("load", function () {
    var headers = document.querySelectorAll("#accessibilityPage section header");
    
    for (var i = 0; i < headers.length; ++i)
        headers[i].addEventListener("click", (e) => { toggleHeaderContent(e); }, false);
});

/**
 * toggles the state of the headers content
 * shows/hides the headers content if its hidden/shown
 */
function toggleHeaderContent(e) {
    var header = e.target;
    while (header.tagName.toLowerCase() != "header") header = header.parentElement;

    if (!header.parentElement.classList.contains("closed"))
        header.parentElement.classList.add("closed");
    else
        header.parentElement.classList.remove("closed");
}
