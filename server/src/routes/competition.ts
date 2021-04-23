import DB, { Category, CompetitionRepo, Page, Sponsor, Tag } from '../database';
import { parentDir, fileName, upload, move, remove, unzip, chain } from '../files';
import { validForm, Form } from '@shared/validation/competitionForm';
import { deserialize } from '@shared/objectFormdata';
import { FindManyOptions } from 'typeorm';
import { isAdmin } from '../auth';
import express from 'express';
const router = express.Router();

const order: FindManyOptions = { order: { order: 'ASC' } };

const respond = <T>(promise: Promise<T>, res: express.Response, result: (data: T) => any = data => data) => {
    promise.then(data => res.send(result(data))).catch(() => res.json({ error: 'Error fetching data' }));
}

router.get('/categories', (_, res) => respond(DB.repo(Category).find(order), res, categories => categories.map(category => category.name)));
router.get('/sponsors', (_, res) => respond(DB.repo(Sponsor).find(order), res));
router.get('/pages', (_, res) => respond(DB.repo(Page).find(order), res));
router.get('/tags', (_, res) => respond(DB.repo(Tag).find(order), res));

router.get('/data', (_, res) => {
    respond(Promise.all([
        DB.crepo(CompetitionRepo).instance(),
        DB.repo(Category).find(order),
        DB.repo(Tag).find(order),
        DB.repo(Page).find(order),
        DB.repo(Sponsor).find(order)
    ]), res, ([competition, categories, tags, pages, sponsors]) => ({
        name: competition?.name || '',
        categories: categories,
        tags: tags,
        pages: pages,
        sponsors: sponsors
    }));
});

router.put('/save',/*  isAdmin, TODO*/ (req, res) => {
    let data: Form = deserialize(req) as Form;
    if (!validForm(data)) return res.json({ error: 'Invalid data' });
    let uploads: Promise<void>[] = [];

    let pagedir = '/client/public/'; // TODO: store in server, adjust iframe source? change iframe base target?
    data.pages.forEach(page => {
        let source = `pages${page.path.length == 1 ? '' : page.path}/_page/${page.html?.name || fileName(page.source)}`;
        const getDir = (src: string) => src ? parentDir(pagedir + src) : '';
        let dir = getDir(source);
        let old = getDir(page.source);
        if (!page.html && (!old || dir == old)) return;
        const uploadFiles = page.html ? () => chain(() => upload(dir, ...[page.html, page.zip]), page.zip ? () => unzip(`${dir}/${page.zip.name}`) : null) : () => move(old, dir);
        uploads.push(chain(() => remove(dir, page.html ? old : ''), () => uploadFiles()));
        page.source = source;
    });

    let sponsordir = '/client/public/_icons/'; // TODO: sponsor icon folder in server?
    data.sponsors.forEach(sponsor => {
        if (!sponsor.img) return;
        // TODO: upload
        sponsor.icon = sponsor.img.name;
    });

    const error = (action: string): any => res.json({ error: `Error ${action}`});
    Promise.all(uploads).then(() => Promise.all([
        DB.crepo(CompetitionRepo).setName(data.name),
        DB.setRepo(DB.repo(Category), data.categories.map(x => new Category(x.name, x.order)), x => [x.name]),
        DB.setRepo(DB.repo(Tag), data.tags.map(x => new Tag(x.name, x.description, x.order)), x => [x.name]),
        DB.setRepo(DB.repo(Page), data.pages.map(x => new Page(x.name, x.path, x.source, x.order)), x => [x.path], x => [parentDir(pagedir + x.source)]),
        DB.setRepo(DB.repo(Sponsor), data.sponsors.map(x => new Sponsor(x.link, x.icon, x.order)), x => [x.link], x => [sponsordir + x.icon])
    ]).then(() => res.json({})).catch(() => error('saving'))).catch(() => error('uploading'));
});

export default { path: '/competition', router };
