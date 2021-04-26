// general functions to validate a form

const state = (...feedback: string[]): boolean => feedback.every(string => string.length == 0);
const validInput = (feedback: string, ...inputs: string[]): boolean => state(feedback) && inputs.every(input => input.length > 0);

const validateString = (input: string, name: string, min: number, max: number, required: boolean = true, unique: string[] = []): string => {
    let l = input.length;
    if (required && !input) return `${name} is required`;
    if (unique.indexOf(input) >= 0) return `${name} already exists`;
    if (l && min >= 0 && l < min) return `${name} must be at least ${min} characters`;
    else if (max >= 0 && l > max) return `${name} must be at most ${max} characters`;
    return '';
}

const regexPassword = (input: string): string => {
    if (!/[a-z]/.test(input)) {
        return 'Password must contain 1 lower case character';
    }
    if (!/[A-Z]/.test(input)) {
        return 'Password must contain 1 upper case character';
    }
    if (!/[0-9]/.test(input)) {
        return 'Password must contain 1 number';
    }
    if (!/[_\-\?!@#$^&\*]/.test(input)) {
        return 'Password must contain 1 special character: _-?!@#$^&*';
    }
    return '';
}

const regexName = (input: string, name: string): string => {
    if (!/^[a-zA-Z0-9_.]*$/.test(input)) {
        return `${name} can only contain alphanumerical characters or \'_.\'`;
    }
    if (/(_\.)/.test(input)) {
        return '\'_\' can\'t be followed by \'.\'';
    }
    if (/(\._)/.test(input)) {
        return '\'.\' can\'t be followed by \'_\'';
    }
    if (/(\.\.)/.test(input)) {
        return '\'.\' can\'t be followed by \'.\'';
    }
    if (/(__)/.test(input)) {
        return '\'_\' can\'t be followed by \'_\'';
    }
    return '';
}

export { state, validInput, validateString, regexPassword, regexName };
