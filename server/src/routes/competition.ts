import DB, { Category, CompetitionRepo, Page, Sponsor, Tag } from '../database';
import { parentDir, fileName, upload, move, remove, unzip, chain } from '../files';
import { validForm, Form } from '@shared/validation/competitionForm';
import { deserialize } from '@shared/objectFormData';
import { FindManyOptions } from 'typeorm';
import { isAdmin } from '../auth';
import express from 'express';
const router = express.Router();

const order: FindManyOptions = { order: { order: 'ASC' } };

const respond = <E>(promise: Promise<E>, res: express.Response, result: (data: E) => any = data => data) => {
    promise.then(data => res.send(result(data))).catch(() => res.json({ error: 'Error fetching data' }));
}

router.get('/categories', (_, res) => respond(DB.repo(Category).find(order), res, categories => categories.map(category => category.name)));
router.get('/name', (_, res) => respond(DB.crepo(CompetitionRepo).instance(), res, competition => competition.name));
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

router.put('/save', isAdmin, (req, res) => {
    let data: Form = deserialize(req) as Form;
    if (!validForm(data)) return res.json({ error: 'Invalid data' });

    let moves: Promise<void>[] = [];
    let initialUploads: Promise<void>[] = [];
    let secondaryUploads: (() => Promise<void>)[] = [];
    const uploadFiles = <E>(items: E[], base: string, newFile: (e: E) => boolean, getDir: (e: E) => string, getOld: (e: E) => string, getTemp: (e: E) => string, getUpload: (e: E, dir: string) => Promise<void>, set: (e: E, dir: string) => void) => {
        items.forEach(item => {
            let file = newFile(item);
            let [dir, old] = [getDir(item), getOld(item)];
            let [bdir, bold] = [base + dir, base + old];
            if (!file && (!old || dir == old)) return;
            let moving = dir != old && items.some(x => getDir(x) == old);
            if (moving) {
                let temp = `${parentDir(bold)}/${getTemp(item)}`;
                moves.push(move(bold, temp));
                bold = temp;
            }
            const upload = () => chain(() => remove(bdir, file && old ? bold : ''), file ? () => getUpload(item, bdir) : () => move(bold, bdir));
            moving || items.some(x => getOld(x) == dir) ? secondaryUploads.push(upload) : initialUploads.push(upload());
            set(item, dir);
        });
    }

    const uploaddir = '/server/public/'; // TODO: store in server

    uploadFiles(data.pages, uploaddir,
        page => Boolean(page.html),
        page => `pages${page.path.length == 1 ? '' : page.path}/_page`,
        page => parentDir(page.source),
        _ => '_temp',
        (page, dir) => chain(() => upload(dir, page.html, page.zip), page.zip ? () => unzip(`${dir}/${page.zip.name}`) : null),
        (p, dir) => p.source = `${dir}/${p.html?.name || fileName(p.source)}`);

    uploadFiles(data.sponsors, uploaddir,
        sponsor => Boolean(sponsor.img),
        sponsor => `sponsors/${sponsor.name}`,
        sponsor => parentDir(sponsor.icon),
        sponsor => '_' + sponsor.name,
        (sponsor, dir) => upload(dir, sponsor.img),
        (p, dir) => p.icon = `${dir}/${p.img?.name || fileName(p.icon)}`);

    const error = (action: string): any => {
        res.json({ error: `Error ${action}`})
        console.log(action);
    }
    Promise.all([chain(() => Promise.all(moves), () => Promise.all(secondaryUploads.map(upload => upload()))), ...initialUploads]).then(() => Promise.all([
        DB.crepo(CompetitionRepo).setName(data.name),
        DB.setRepo(DB.repo(Category), data.categories.map(x => new Category(x.name, x.order)), x => [x.name]),
        DB.setRepo(DB.repo(Tag), data.tags.map(x => new Tag(x.name, x.description, x.order)), x => [x.name]),
        DB.setRepo(DB.repo(Page), data.pages.map(x => new Page(x.name, x.path, x.source, x.order)), x => [x.path], x => [parentDir(uploaddir + x.source)]),
        DB.setRepo(DB.repo(Sponsor), data.sponsors.map(x => new Sponsor(x.name, x.link, x.icon, x.order)), x => [x.name], x => [parentDir(uploaddir + x.icon)])
    ]).then(() => res.json({})).catch((err) => error(err))).catch((err) => error(err));
});

export default { path: '/competition', router };
