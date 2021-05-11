/**
 * script to handle the subject form
 * sets html validation for the date and hour input fields,
 * this validation is repeated server side
 */

var fairStartDate;
var fairEndDate;
var fairStartHour;
var fairEndHour;
var initialStartDate;

/**
 * help function to write the event listeners below more elegantly
 */
function onChange(button, listener) {
    if (button) button.addEventListener("change", listener, false);
}

window.addEventListener("load", function () {
    fairStartDate = document.querySelector("input[name=startdate]");
    fairEndDate = document.querySelector("input[name=enddate]");
    fairStartHour = document.querySelector("input[name=starthour]");
    fairEndHour = document.querySelector("input[name=endhour]");
    initialStartDate = fairStartDate ? fairStartDate.value : null;

    onChange(fairStartDate, setDateValidation);
    onChange(fairStartHour, () => { updateHourValue(fairStartHour) });
    onChange(fairEndHour, () => { updateHourValue(fairEndHour) });

    setDateValidation();
});

/**
 * function to set validation for the fair start and end dates
 * this validation has to be repeated server side
 */
function setDateValidation() {
    if (!fairStartDate || !fairEndDate) return;
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var dd = tomorrow.getDate();
    var mm = tomorrow.getMonth() + 1;
    var yyyy = tomorrow.getFullYear();
    tomorrow = yyyy + "-" + (mm < 10 ? "0" + mm : mm) + "-" + (dd < 10 ? "0" + dd : dd);
    if (!initialStartDate || fairStartDate.value != initialStartDate || initialStartDate > tomorrow) // only set the minimum start date validation if the date is being changed or created
        fairStartDate.setAttribute("min", tomorrow);
    else fairStartDate.setAttribute("min", initialStartDate); // the start date is valid if it is not being changed or created
    fairEndDate.setAttribute("min", fairStartDate.value);
    var nextYear = fairStartDate.valueAsDate;
    if (!nextYear) return;
    dd = nextYear.getDate() - 1;
    mm = nextYear.getMonth() + 1;
    yyyy = nextYear.getFullYear() + 1;
    nextYear = yyyy + "-" + (mm < 10 ? "0" + mm : mm) + "-" + (dd < 10 ? "0" + dd : dd);
    fairEndDate.setAttribute("max", nextYear);
}

/**
 * function to update the hour value fro an hour input field
 * sets the minute field to 0, as only round hours are allowed
 */
function updateHourValue(hourField) {
    var value = hourField.value;
    if (!value) return;
    var hours = value.substr(0, value.indexOf(':')); 
    hourField.value = hours + ":00";
}
