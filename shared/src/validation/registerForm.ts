// functions to validate teh register form

import { state, validInput, validateString, regexName, is } from '../validation';

type Form = { username: string, password: string, confirmPassword: string, category: string };

const validForm = (f: Form): boolean => isForm(f) && state(validateUsername(f.username), validatePassword(f.password, f.confirmPassword)) && validInput('', f.category);

const validateUsername = (name: string, required: boolean = true): string => {
    let feedback = validateString(name, 'Username', 3, 32, required);
    if (!feedback) feedback = regexName(name, 'Username');
    return feedback;
}

const validatePassword = (password: string, confirmPassword: string, required: boolean = true): string => {
    let feedback = validateString(password, 'Password', 6, -1, required);
    if (!feedback && password) feedback = regexPassword(password);
    if (!feedback && (required || confirmPassword) && password != confirmPassword) return 'Passwords do not match';
    return feedback;
}

const regexPassword = (password: string): string => {
    let tests: { [test: string]: RegExp } = {
        'a lowercase character': /[a-z]/,
        'an uppercase character': /[A-Z]/,
        'a number': /[0-9]/
    }

    for (const test in tests) {
        if (!tests[test].test(password))
            return 'Password must contain ' + test;
    }

    return '';
}

const isForm = (f: any) => is.object(f) && is.string(f.username) && is.string(f.password) && is.string(f.confirmPassword) && is.string(f.category);

export { state, validInput, validateString, validateUsername, validatePassword, validForm, Form };
