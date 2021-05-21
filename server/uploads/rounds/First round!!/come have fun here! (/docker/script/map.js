/**
 * script to initialize the map and allow the user to place their marker
 */

var longitudeInput;
var latitudeInput;
var userInput;
var startingZoom;
var map;
var marker;

window.addEventListener("load", function() {
    longitudeInput = document.querySelector("#map input[name=longitude]");
    latitudeInput = document.querySelector("#map input[name=latitude]");
    userInput = !longitudeInput.disabled && !latitudeInput.disabled;
    var startingMarker = longitudeInput.value != "" && latitudeInput.value != "";

    var setLocationButon = document.getElementById("set");
    var clearLocationButon = document.getElementById("clear");

    setLocationButon.addEventListener("click", setLocation);
    if (clearLocationButon) clearLocationButon.addEventListener("click", clearLocation);

    startingZoom = 27; // default zoom level (in case there is a marker to zoom in on)
    var startingPoint = ol.proj.fromLonLat([4.5, 50.5]); // default starting point, the center of belgium
    if (startingMarker) startingPoint = ol.proj.fromLonLat([longitudeInput.value, latitudeInput.value]); // change the starting point if it is provided

    // create the map
    map = new ol.Map({
        layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
        view: new ol.View({ center: startingPoint, minZoom: 7, zoom: startingMarker ? startingZoom : 12, maxZoom: 37, zoomFactor: 1.5 }),
        controls : [],
        target: "map"
    });

    // the location marker
    marker = new ol.Feature({
        geometry: startingMarker ? new ol.geom.Point(startingPoint) : null
    });

    // create the source to contain the location marker
    var markerInput = new ol.source.Vector({ features: [marker] });

    // show the location marker as the marker icon
    var markerDisplay = new ol.layer.Vector({
        source: markerInput,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                src: "images/marker.png",
                anchor: [0.5, 1],
                anchorXUnits: "fraction",
                anchorYUnits: "fraction"
            })
        })
    });

    // add the marker to the map
    map.addLayer(markerDisplay);
    updateMarkerPosition(); // and update its position in the form

    if (userInput) { // if user input is enabled on the map
        // add translate interaction to the marker, allowing the user to move it by dragging
        var translate = new ol.interaction.Translate({ source: markerInput });
        map.addInteraction(translate);

        // update marker position on translate
        translate.on("translating", updateMarkerPosition);

        // add click interaction to the marker, allowing the user to move it by clicking
        map.on("click", function (e) {
            var coords = map.getCoordinateFromPixel(e.pixel);
            marker.setGeometry(new ol.geom.Point(coords));
            updateMarkerPosition();
        });
    }
});

/**
 * function to set the location and zoom of the map
 * if the map allows user input,
 * attempt to set the location of the marker and the map to the users current location
 * else, set the location of the map to the current location of the marker
 */
function setLocation() {
    if (userInput) {
        navigator.geolocation.getCurrentPosition(function (pos) {
            var coords = ol.proj.fromLonLat([pos.coords.longitude, pos.coords.latitude]);
            marker.setGeometry(new ol.geom.Point(coords));
            map.getView().setCenter(coords);
            map.getView().setZoom(startingZoom);
            updateMarkerPosition();
        });
    }
    else {
        map.getView().setCenter(marker.getGeometry().getCoordinates());
        map.getView().setZoom(startingZoom);
    }
}

/**
 * function to clear the location of the marker from the map
 */
function clearLocation() {
    marker.setGeometry(null);
    updateMarkerPosition();
}

/**
 * function to update the users marker position in the form
 */
function updateMarkerPosition() {
    var geometry = marker.getGeometry();
    var pos = geometry == null ? ["", ""] : ol.proj.toLonLat(geometry.getCoordinates());
    longitudeInput.value = pos[0];
    latitudeInput.value = pos[1];
}
