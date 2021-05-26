// functions to validate the competition form

import { File as UFile } from 'formidable';
import { state, validInput, validateString, validateCharacters, validateList, is } from '../validation';

type Category = { name: string, order: number };
type Tag = { name: string, description: string, order: number };
type Page = { name: string, path: string, source: string, order: number, html: File | UFile | null, zip: File | UFile | null };
type Sponsor = { name: string, link: string, icon: string, order: number, img: File | UFile | null };
type Form = { name: string, categories: Category[], tags: Tag[], pages: Page[], sponsors: Sponsor[] };

const validForm = (f: Form): boolean => {
    let v = isf.form(f);
    v = v && state(validate.name(f.name), validate.categories(f.categories), validate.tags(f.tags), validate.pages(f.pages), validate.sponsors(f.sponsors));
    v = v && f.categories.every(category => state(validate.category(category, f.categories)));
    v = v && f.tags.every(tag => state(validate.tag(tag, f.tags)));
    v = v && f.pages.every(page => state(validate.page(page, f.pages)));
    return v && f.sponsors.every(sponsor => state(validate.sponsor(sponsor, f.sponsors)));
}

const validate = {
    name: (name: string): string => validateString(name, 'Competition name', 3, 32),
    categories: (categories: Category[]): string => validateList(categories, 'category', true),
    pages: (pages: Page[]): string => pages.findIndex(x => x.path == '/') < 0 ? `A page with path '/' is required` : '',
    tags: (tags: Tag[]): string => validateList(tags, 'tag', false),
    sponsors: (sponsors: Sponsor[]): string => validateList(sponsors, 'sponsor', false),

    category: (category: Category, categories: Category[], add?: boolean): string => {
        return validateString(category.name, 'Category', 3, 32, !add, categories.map(x => x.name), !add);
    },
    tag: (tag: Tag, tags: Tag[] = [], add?: boolean): string => {
        return validateString(tag.name, 'Tag name', 3, 32, !add, tags.map(x => x.name), !add);
    },
    page: (page: Page, pages: Page[], add?: boolean): string => {
        let v = validateString(page.name, 'Page name', 3, 32, !add);
        if (!v && page.path && !page.path.startsWith('/')) v = `Page path must start with '/'`;
        if (!v && page.path.startsWith('/api')) v = `Page path cannot start with '/api'`;
        if (!v) v = validateCharacters(page.path, 'Page path', undefined, /([a-zA-Z0-9\/\-]+)/g);
        if (!v && page.path.includes('//')) v = `Page path cannot have multiple '/'s in a row`;
        if (!v && page.path.length > 1 && page.path.endsWith('/')) v = `Page path cannot end with '/'`;
        if (!v) v = validateString(page.path, 'Page path', 1, 32, !add, pages.map(x => x.path), !add);
        if (!v && !add && !page.source && !page.html) v = 'Page source is required';
        if (!v && !add && page.zip && !page.html) v = 'New page dependencies require a new page source';
        if (!v && page.html && !page.html.name?.endsWith('.html')) v = 'Page source must be a .html file';
        if (!v && page.zip && !page.zip.name?.endsWith('.zip')) v = 'Page dependencies must be contained in a .zip file';
        return v;
    },
    sponsor: (sponsor: Sponsor, sponsors: Sponsor[], add?: boolean): string => {
        let v = validateCharacters(sponsor.name, 'Sponsor name', true);
        if (!v) v = validateString(sponsor.name, 'Sponsor name', 3, 32, !add, sponsors.map(x => x.name), !add);
        if (!v) v = validateString(sponsor.link, 'Sponsor link', -1, 128, !add);
        if (!v && !add && !sponsor.icon && !sponsor.img) v = 'Sponsor icon is required';
        return v;
    }
}

const isf = { // check if a given variable with type any is a Form
    form: (form: any): boolean => {
        let v = is.object(form) && is.string(form.name);
        return v && is.array(form.categories, isf.category) && is.array(form.tags, isf.tag) && is.array(form.pages, isf.page) && is.array(form.sponsors, isf.sponsor);
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
        return is.object(sponsor) && is.string(sponsor.name) && is.string(sponsor.link) && is.string(sponsor.icon) && is.number(sponsor.order);
    }
}

export { state, validInput, validForm, validate, Category, Tag, Page, Sponsor, Form, isf };
