// general functions to validate a form

const state = (...feedback: string[]): boolean => feedback.every(string => string.length == 0);
const validInput = (feedback: string, ...inputs: string[]): boolean => state(feedback) && inputs.every(input => input.length > 0);

const validateString = (input: string, name: string, min: number, max: number, required: boolean = true, unique: string[] = [], included: boolean = true): string => {
    let l = input.length;
    if (required && !input) return `${name} is required`;
    if (l && unique.map(s => s.toLowerCase()).filter(x => x == input.toLowerCase()).length > (included ? 1 : 0)) return `${name} already exists`;
    if (l && min >= 0 && l < min) return `${name} must be at least ${min} characters`;
    else if (max >= 0 && l > max) return `${name} must be at most ${max} characters`;
    return '';
}

const regexName = (input: string, name: string): string => {
    let invalidChars = input.replace(/([a-zA-Z0-9 \_\-]+)/g, '');
    if (invalidChars) return `${name} cannot contain the following characters: '${invalidChars}'`;
    return '';
}

const is = {
    string: (v: any): boolean => typeof v == 'string',
    number: (v: any): boolean => typeof v == 'number',
    object: (v: any): boolean => v && typeof v == 'object',
    array: (v: any, t: (x: any) => boolean): boolean => Array.isArray(v) && (v as any[]).every(x => t(x))
}

export { state, validInput, validateString, regexName, is };
