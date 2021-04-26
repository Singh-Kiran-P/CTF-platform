/**
 * script for home.php
 * toggles the search options for the search form
 */

var searchOptions;
var searchHeader;
var searchButton;

function onEvent(button, event, listener) {
    if (button) button.addEventListener(event, listener, false);
}

window.addEventListener("load", function () {
    searchOptions = document.querySelector("#homePage form");
    searchHeader = document.querySelector("#homePage form > header");
    searchButton = document.querySelector("#homePage form > button");
    
    onEvent(searchOptions, "submit", searchOptionsSubmit);
    onEvent(searchHeader, "click", toggleSearchOptions);
    onEvent(searchButton, "click", toggleSearchOptions);
});

/**
 * function called when the search options are submitted
 * prevents submission if a location is required, but not provided
 * and shows an error message instead
 */
function searchOptionsSubmit(e) {
    var maximumDistance = document.querySelector("input[name=distance]").value != "";
    var orderByDistance = document.querySelector("select[name=orderby]").value == "distance";
    var longitude = document.querySelector("input[name=longitude]");
    var latitude = document.querySelector("input[name=latitude]");
    var locationProvided = longitude.value != "" && latitude.value != "";
    var locationRequired = maximumDistance || orderByDistance;

    if (locationRequired && !locationProvided) {
        var locationText = document.querySelector(".mapContainer .errorMessage");
        locationText.parentElement.classList.add("invalid");
        locationText.innerHTML = "Required";
        if (maximumDistance) locationText.innerHTML += " for maximum distance"
        else if (orderByDistance) locationText.innerHTML += " to order by distance"
        e.preventDefault();
    }
}

/**
 * toggles the state of the search options
 * opens/closes the search options if theyre closed/open
 */
function toggleSearchOptions() {
    if (!searchOptions.classList.contains("closed"))
        searchOptions.classList.add("closed");
    else {
        searchOptions.classList.remove("closed");

        // reload the map content by triggering a window resize event
        // not doing this will result in the map content being invisible after resizing with the form closed
        window.dispatchEvent(new Event("resize"));
    }
}
