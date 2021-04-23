// functions to validate the competition form

import { File as UFile } from 'formidable';
import { state, validInput, validateString, is } from '../validation';

type Category = { name: string, order: number };
type Tag = { name: string, description: string, order: number };
type Page = { name: string, path: string, source: string, order: number, html: File | UFile | null, zip: File | UFile | null };
type Sponsor = { link: string, icon: string, order: number, img: File | UFile | null };
type Form = { name: string, categories: Category[], tags: Tag[], pages: Page[], sponsors: Sponsor[] };

const validForm = (f: Form, checkType: boolean = true): boolean => {
    let valid = (!checkType || isf.form(f));
    valid = valid && state(validate.name(f.name), validate.categories(f.categories), validate.tags(f.tags), validate.pages(f.pages), validate.sponsors(f.sponsors));
    valid = valid && f.categories.every(category => state(validate.category(category, f.categories)));
    valid = valid && f.tags.every(tag => state(validate.tag(tag, f.tags)));
    valid = valid && f.pages.every(page => state(validate.page(page, f.pages)));
    return valid && f.sponsors.every(sponsor => state(validate.sponsor(sponsor, f.sponsors)));
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
    sponsors: (sponsors: Sponsor[]): string => '',

    category: (category: Category, categories: Category[], add: boolean = false): string => {
        return validateString(category.name, 'Category', 3, 32, !add, categories.map(x => x.name), !add);
    },
    tag: (tag: Tag, tags: Tag[] = [], add: boolean = false): string => {
        return validateString(tag.name, 'Tag name', 3, 32, !add, tags.map(x => x.name), !add);
    },
    page: (page: Page, pages: Page[], add: boolean = false): string => {
        let r = '';
        if (!r) r = validateString(page.name, 'Page name', 3, 32, !add);
        if (!r && page.path && !page.path.startsWith('/')) r = `Page path must start with '/'`;
        if (!r && page.path.startsWith('/api')) r = `Page path cannot start with '/api'`;
        let invalidChars = page.path.replace(/([a-zA-Z0-9\/\-]+)/g, '');
        if (!r && invalidChars) r = `Page path cannot contain the following characters: '${invalidChars}'`;
        if (!r && /\/\//.test(page.path)) r = `Page path cannot have multiple '/'s in a row`;
        if (!r && page.path.length > 1 && page.path.endsWith('/')) r = `Page path cannot end with '/'`;
        if (!r) r = validateString(page.path, 'Page path', 1, 32, !add, pages.map(x => x.path), !add);
        if (!r && !add && !page.source && !page.html) r = 'Page source is required';
        if (!r && page.html?.name && !page.html.name.endsWith('.html')) r = 'Page source must be a .html file';
        if (!r && page.zip?.name && !page.zip.name.endsWith('.zip')) r = 'Page dependencies must be contained in a .zip file';
        return r;
    },
    sponsor: (sponsor: Sponsor, sponsors: Sponsor[], add: boolean = false): string => {
        let r = validateString(sponsor.link, 'Sponsor link', -1, 32, !add, sponsors.map(x => x.link), !add);
        if (!r && !add && !sponsor.icon && !sponsor.img) r = 'Sponsor icon is required';
        return r;
    }
}

const isf = { // check if a given variable with type any is a Form
    form: (form: any): boolean => {
        let valid = is.object(form) && is.string(form.name);
        return valid && is.array(form.categories, isf.category) && is.array(form.tags, isf.tag) && is.array(form.pages, isf.page) && is.array(form.sponsors, isf.sponsor);
    },
    category: (category: any): boolean => {
        return is.object(category) && is.string(category.name) && is.number(category.order);
    },
    tag: (tag: any): boolean => {
        return is.object(tag) && is.string(tag.name) && is.string(tag.description)  && is.number(tag.order);
    },
    page: (page: any): boolean => {
        return is.object(page) && is.string(page.name) && is.string(page.path) && is.string(page.source) && is.number(page.order);
    },
    sponsor: (sponsor: any): boolean => {
        return is.object(sponsor) && is.string(sponsor.link) && is.string(sponsor.icon) && is.number(sponsor.order);
    }
}

export { state, validInput, validForm, validateString, validate, Category, Tag, Page, Sponsor, Form };
