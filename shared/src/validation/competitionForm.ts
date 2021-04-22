// functions to validate the competition form

import { File as UFile } from 'formidable';
import { state, validInput, validateString, is as isp } from '../validation';

type Category = { name: string, priority: number };
type Tag = { name: string, description: string };
type Page = { name: string, path: string, source: string, html: File | UFile | null, zip: File | UFile | null };
type Form = { name: string, categories: Category[], tags: Tag[], pages: Page[] };

const validForm = (f: Form, checkType: boolean = true): boolean => {
    return (!checkType || is.form(f)) && state(validate.name(f.name), validate.categories(f.categories), validate.tags(f.tags), validate.pages(f.pages));
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

    category: (category: Category, categories: Category[], required: boolean = true): string => {
        if (!required && !category.name) return '';
        return validateString(category.name, 'Category', 3, 32, required, categories.map(x => x.name));
    },
    tag: (tag: Tag, tags: Tag[] = [], required: boolean = true): string => {
        if (!required && !tag.name) return '';
        return validateString(tag.name, 'Tag name', 3, 32, required, tags.map(x => x.name));
    },
    page: (page: Page, pages: Page[], required: boolean = true): string => {
        let r = '';
        if (!r) r = validateString(page.name, 'Page name', 3, 32, required);
        if (!r && page.path && !page.path.startsWith('/')) r = `Page path must start with '/'`;
        let invalidChars = page.path.replace(/([a-zA-Z0-9\/\-]+)/g, '');
        if (!r && invalidChars) r = `Page path cannot contain the following characters: '${invalidChars}'`;
        if (!r && /\/\//.test(page.path)) r = `Page path cannot have multiple '/'s in a row`;
        if (!r && page.path.length > 1 && page.path.endsWith('/')) r = `Page path cannot end with '/'`;
        if (!r) r = validateString(page.path.toLowerCase(), 'Page path', 1, -1, required, pages.map(x => x.path.toLowerCase()));
        if (!r && page.html?.name && !page.html.name.endsWith('.html')) r = 'Page source must be a .html file';
        if (!r && page.zip?.name && !page.zip.name.endsWith('.zip')) r = 'Page attachments must be contained in a .zip file';
        return r;
    }
}

const is = { // check if a given variable with type any is a Form
    form: (form: any): boolean => {
        return isp.object(form) && isp.string(form.name) && isp.array(form.categories, is.category) && isp.array(form.tags, is.tag) && isp.array(form.pages, is.page);
    },
    category: (category: any): boolean => {
        return isp.object(category) && isp.string(category.name) && isp.number(category.priority);
    },
    tag: (tag: any): boolean => {
        return isp.object(tag) && isp.string(tag.name) && isp.string(tag.description);
    },
    page: (page: any): boolean => {
        return isp.object(page) && isp.string(page.name) && isp.string(page.path) && isp.string(page.source);
    }
}

export { state, validInput, validForm, validateString, validate, Category, Tag, Page, Form };
