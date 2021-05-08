import { parentDir, fileName, upload, unzip, chain, uploadFiles, uploaddir } from '../files';
import DB, { Category, CompetitionRepo, Page, Sponsor, Tag } from '../database';
import { validForm, Form } from '@shared/validation/competitionForm';
import { deserialize } from '@shared/objectFormdata';
import { FindManyOptions } from 'typeorm';
import { isAdmin } from '../auth';
import express from 'express';
const router = express.Router();

const order: FindManyOptions = { order: { order: 'ASC' } };

router.get('/categories', (_, res) => DB.respond(DB.repo(Category).find(order), res, categories => categories.map(category => category.name)));
router.get('/name', (_, res) => DB.respond(DB.crepo(CompetitionRepo).instance(), res, competition => competition.name));
router.get('/sponsors', (_, res) => DB.respond(DB.repo(Sponsor).find(order), res));
router.get('/pages', (_, res) => DB.respond(DB.repo(Page).find(order), res));
router.get('/tags', (_, res) => DB.respond(DB.repo(Tag).find(order), res));

router.get('/data', (_, res) => {
    DB.respond(Promise.all([
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

router.put('/save', isAdmin, (req, res) => {
    let data: Form = deserialize(req) as Form;
    if (!validForm(data)) return res.json({ error: 'Invalid data' });

    let pageUploads = uploadFiles(data.pages, uploaddir, page => Boolean(page.html), _ => [''], // TODO: does not work
        _ => '_temp', page => `/pages${page.path.length == 1 ? '' : page.path}/_page`, page => parentDir(page.source),
        (page, dir) => chain(() => upload(dir, page.html, page.zip), page.zip ? () => unzip(`${dir}/${page.zip.name}`) : null),
        (p, dir) => p.source = `${dir}/${p.html?.name || fileName(p.source)}`);

    let sponsorUploads = uploadFiles(data.sponsors, uploaddir, sponsor => Boolean(sponsor.img), _ => [''], // TODO: test
        sponsor => '_' + sponsor.name, sponsor => `/sponsors/${sponsor.name}`, sponsor => parentDir(sponsor.icon), (sponsor, dir) => upload(dir, sponsor.img),
        (p, dir) => p.icon = `${dir}/${p.img?.name || fileName(p.icon)}`);

    const error = (action: string): any => res.json({ error: `Error ${action}`});
    Promise.all([pageUploads, sponsorUploads]).then(() => Promise.all([
        DB.crepo(CompetitionRepo).setName(data.name),
        DB.setRepo(DB.repo(Category), data.categories.map(x => new Category(x))),
        DB.setRepo(DB.repo(Tag), data.tags.map(x => new Tag(x))),
        DB.setRepo(DB.repo(Page), data.pages.map(x => new Page(x)), {}, x => [parentDir(uploaddir + x.source)]),
        DB.setRepo(DB.repo(Sponsor), data.sponsors.map(x => new Sponsor(x)), {}, x => [parentDir(uploaddir + x.icon)])
    ]).then(() => res.json({})).catch(() => error('saving'))).catch(() => error('uploading'));
});

export default { path: '/competition', router };
