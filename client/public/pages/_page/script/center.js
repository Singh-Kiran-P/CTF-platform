/**
 * script to center all .centerVertical and .centerHorizontal elements within their parent
 * 
 * this can be done using css, but can often be quite difficult or create problems
 * EG: margin-top and margin-bottom % is calculated based on the width
 * EG: margin auto or flexbox resizing centers the element even if it is bigger than the parent, making parts of it inaccessible
 * this makes it really easy and simple to center an element both horizontally and vertically
 */

// elements to be centered
var centerHorizontal; // horizontally
var centerVertical; // vertically
var centerElements; // horizontally and/or vertically

// center elements on:
// - screen resize
window.addEventListener("resize", center);

// - update
var observer = new MutationObserver(center);

// - load
window.addEventListener("load", initCenter);

/**
 * initialize the centering for all center elements
 * fills in the center lists (centerHorizontal, centerVertical and centerElements),
 * centers all elements for the first time,
 * sets them as visible and adds the update observer
 */
function initCenter() {
    centerHorizontal = document.querySelectorAll(".center, .centerHorizontal");
    centerVertical = document.querySelectorAll(".center, .centerVertical");
    centerElements = document.querySelectorAll(".center, .centerHorizontal, .centerVertical");
    
    center();

    for (var i = 0; i < centerElements.length; ++i) {
        centerElements[i].style.visibility = "visible";
        observer.observe(centerElements[i], { attributes: true });
    }
}

/**
 * center all elements with a center class:
 * center .centerHorizontal elements horizontally,
 * center .centerVertical elements vertically,
 * center .center elements both vertically and horizontally
 */
function center() {
    // center horizontally
    for (var i = 0; i < centerHorizontal.length; ++i) {
        var width = outsideWidth(centerHorizontal[i]);
        var parentWidth = insideWidth(centerHorizontal[i].parentElement);
        centerHorizontal[i].style.marginLeft = Math.max(Math.round((parentWidth - width) / 2), 0) + "px";
    }
    
    // center vertically
    for (var i = 0; i < centerVertical.length; ++i) {
        var height = outsideHeight(centerVertical[i]);
        var parentHeight = insideHeight(centerVertical[i].parentElement);
        centerVertical[i].style.marginTop = Math.max(Math.round((parentHeight - height) / 2), 0) + "px";
    }
}

/**
 * return the value of the property of the given element as a rounded integer
 */
function value(element, property) {
    return Math.round(parseFloat(window.getComputedStyle(element).getPropertyValue(property)));
}

/**
 * return the total width of the element, including padding and border width
 */
function outsideWidth(element) {
    return value(element, "width");
}

/**
 * return the inside width of the element, excluding padding and border width
 */
function insideWidth(element) {
    var padding = value(element, "padding-left") + value(element, "padding-right");
    var border = value(element, "border-left-width") + value(element, "border-right-width");
    return outsideWidth(element) - padding - border;
}

/**
 * return the outside height of the element, including padding and border height
 */
function outsideHeight(element) {
    return value(element, "height");
}

/**
 * return the inside height of the element, excluding padding and border height
 */
function insideHeight(element) {
    var padding = value(element, "padding-top") + value(element, "padding-bottom");
    var border = value(element, "border-top-width") + value(element, "border-bottom-width");
    return outsideHeight(element) - padding - border;
}
