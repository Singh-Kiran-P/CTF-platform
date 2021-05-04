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

const validateCharacters = (input: string, name: string, disallowed?: RegExp | boolean, allowed?: RegExp): string => {
    if (typeof disallowed == 'boolean') disallowed = /([\\\/\:\*\?\<\>\"\|]+)/g;
    let invalidChars = allowed ? input.replace(allowed, '') : '';
    if (disallowed) invalidChars += input.match(disallowed)?.toString() || '';
    return invalidChars ? `${name} cannot contain the following characters: '${invalidChars}'` : '';
}

const validateList = (list: any[], name: string, required: boolean): string => {
    return required && list.length == 0 ? `At least one ${name} is required` : '';
};

const regexName = (input: string, name: string): string => {
    return validateCharacters(input, name, undefined, /([a-zA-Z0-9 \_\-]+)/g);
}

const is = {
    string: (v: any): boolean => typeof v == 'string',
    number: (v: any): boolean => typeof v == 'number',
    object: (v: any): boolean => v && typeof v == 'object',
    date: (v: any): boolean => is.string(v) && !isNaN(Date.parse(v)),
    array: (v: any, t: (x: any) => boolean): boolean => Array.isArray(v) && (v as any[]).every(x => t(x)),
}

export { state, validInput, validateString, validateCharacters, validateList, regexName, is };
