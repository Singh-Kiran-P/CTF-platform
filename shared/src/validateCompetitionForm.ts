// functions to validate the competition form

type Category = { name: string, priority: number };
type Tag = { name: string, description: string };
type Page = { name: string, path: string, source: string, html: File | null, attachments: File[] };

const state = (...feedback: string[]): boolean => feedback.every(string => string.length == 0);
const validInput = (feedback: string, ...inputs: string[]): boolean => state(feedback) && inputs.every(input =>input.length > 0);

const validForm = (f: { name: string, categories: Category[], tags: Tag[], pages: Page[] }, checkType: boolean = true): boolean => {
    return (!checkType || is.form(f)) && state(validate.name(f.name), validate.categories(f.categories), validate.tags(f.tags), validate.pages(f.pages));
}

const validateString = (input: string, name: string, min: number, max: number, required: boolean = true, unique: string[] = []): string => {
    let l = input.length;
    if (required && !input) return `${name} is required`;
    if (unique.indexOf(input) >= 0) return `${name} already exists`;
    if (l && min >= 0 && l < min) return `${name} must be at least ${min} characters`;
    else if (max >= 0 && l > max) return `${name} must be at most ${max} characters`;
    return '';
}

const validate = {
    name: (name: string): string => {
        return validateString(name, 'Competition name', 3, 32);
    },

    categories: (categories: Category[]): string => {
        return categories.length == 0 ? 'At least one category is required' : '';
    },
    pages: (pages: Page[]): string => {
        return pages.findIndex(x => x.path == '/') < 0 ? "A page with path '/' is required" : '';
    },
    tags: (tags: Tag[]): string => '',

    category: (category: Category, categories: Category[], required: boolean = false): string => {
        if (!required && !category.name) return '';
        return validateString(category.name, 'Category', 3, 32, required, categories.map(x => x.name));
    },
    tag: (tag: Tag, tags: Tag[] = [], required: boolean = false): string => {
        if (!required && !tag.name) return '';
        return validateString(tag.name, 'Tag name', 3, 32, required, tags.map(x => x.name));
    },
    page: (page: Page, pages: Page[], required: boolean = false): string => {
        let r = '';
        if (!r) r = validateString(page.name, 'Page name', 3, 32, required);
        if (!r && page.path && !page.path.startsWith('/')) r = `Page path must start with '/'`;
        let invalidChars = page.path.replace(/([a-zA-Z0-9\/\-]+)/g, '');
        if (!r && invalidChars) r = `Page path cannot contain the following characters: '${invalidChars}'`;
        if (!r) r = validateString(page.path, 'Page path', 1, -1, required, pages.map(x => x.path));
        if (!r && page.html && !page.html.name.endsWith('.html')) r = 'Page source must be an HTML file';
        return r;
    }
}

const is = {
    form: (form: any): boolean => {
        return is.object(form) && is.string(form.name) && is.array(form.categories, is.category) && is.array(form.tags, is.tag) && is.array(form.pages, is.page);
    },
    category: (category: any): boolean => {
        return is.object(category) && is.string(category.name) && is.number(category.priority);
    },
    tag: (tag: any): boolean => {
        return is.object(tag) && is.string(tag.name) && is.string(tag.description);
    },
    page: (page: any): boolean => {
        if (!(is.object(page) && is.string(page.name) && is.string(page.path) && is.string(page.source))) return false;
        return (page.html == null || page.html == undefined || is.object(page.html)) && (page.attachments == undefined || is.array(page.attachments, is.object));
    },
    string: (v: any): boolean => typeof v == 'string',
    number: (v: any): boolean => typeof v == 'number',
    object: (v: any): boolean => v && typeof v == 'object',
    array: (v: any, t: (x: any) => boolean): boolean => Array.isArray(v) && (v as any[]).every(x => t(x))
}

export { state, validInput, validForm, validateString, validate, Category, Tag, Page };
