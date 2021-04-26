/**
 * script to handle forms (login, register and edit profile)
 * if the form is invalid it displays an error message by the invalid fields
 * and prevents the form from being submitted
 */

var loginForm;
var registerForm;
var editProfileForm;

/**
 * help function to write the 3 event lsiteners below more elegantly
 */
function onSubmit(form, listener) {
    if (form) form.addEventListener("submit", listener, false);
}

window.addEventListener("load", function () {
    loginForm = document.querySelector("#loginField form");
    registerForm = document.querySelector("#registerField form");
    editProfileForm = document.querySelector("#profilePage form");

    // call the appropriate functions on button press, along with the event, to be able to prevent the form from submitting
    onSubmit(loginForm, (e) => { validateForm(loginForm, e); });
    onSubmit(registerForm, (e) => { validateForm(registerForm, e); });
    onSubmit(editProfileForm, (e) => { validateForm(editProfileForm, e, parseEditProfileForm); });
});

/**
 * provide validation on the given form using getValidation.php
 * parses the form with parseFormData before validating
 * if the form has invalid input, display an error message and prevent the form from submitting
 */
function validateForm(form, e, parseFormData = function (formData) {}) {
    e.preventDefault(); // prevent the form submission
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = validate;
    xmlhttp.open("POST", "script/ajax/getValidation.php", true);
    var formData = new FormData(form);
    parseFormData(formData);
    xmlhttp.send(formData); // validate the form data

    function validate() {
        if (xmlhttp && xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var errorMessages = JSON.parse(xmlhttp.responseText);
            for (var inputName of Object.keys(errorMessages))
                setInputValidity(form, inputName, errorMessages[inputName]);

            if (validForm(form)) // if the form is valid
                form.submit() // submit the form
        }
    }
}

/**
 * parses the edit profile form data so the AJAX call to getValidation.php will return the appropriate error messages
 */
function parseEditProfileForm(formData) {
    // do not count the change password field as invalid if it is fully empty
    notRequired(editProfileForm, formData, ["confirmChangeLoginPassword", "password", "confirmPassword"]);

    // do not count the delete profile field as invalid if it is fully empty
    notRequired(editProfileForm, formData, ["confirmProfileUsername", "confirmDeleteLoginPassword"]);

    // do not count an input field as invalid if it is the default value
    // not doing this will result in "already registered" errors for default values
    var userData = ["username", "email", "phoneNumber"];
    for (var inputName of userData) {
        if (formData.get(inputName) == editProfileForm.querySelector(`input[name=${inputName}]`).defaultValue) {
            formData.delete(inputName);
            setInputValidity(editProfileForm, inputName, "");
        }
    }
}

/**
 * prevent a list of fields from being marked as invalid if every field in the list is empty
 */
function notRequired(form, formData, fieldList) {
    if (fieldList.every(inputName => formData.get(inputName) == "")) {
        fieldList.forEach(inputName => formData.delete(inputName));
        fieldList.forEach(inputName => setInputValidity(form, inputName, ""));
    }
}

/**
 * set the validity of an input field given the form and the field name
 * set as valid if errorMessage is empty, otherwise set as invalid and show the errormessage
 */
function setInputValidity(form, inputName, errorMessage) {
    var inputBox = form.querySelector(`input[name=${inputName}]`);
    var input = inputBox ? inputBox.parentElement : null;
    if (input) {
        errorMessage == "" ? input.classList.remove("invalid") : input.classList.add("invalid");
        var errorText = input.querySelector(".errorMessage");
        if (errorText) errorText.innerHTML = errorMessage;
    }
}

/**
 * returns if at least one element in the form is marked as invalid
 */
function validForm(form) {
    var invalidChildren = form.querySelectorAll(".invalid");
    return invalidChildren.length == 0;
}
