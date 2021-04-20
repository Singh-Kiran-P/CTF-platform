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

export { state, validInput, validateString };
