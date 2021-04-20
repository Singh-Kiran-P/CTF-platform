import DB, { Category, CompetitionRepo, Page, Tag } from '../database';
import { validForm, Form } from '@shared/validation/competitionForm';
import { deserialize } from '@shared/objectFormdata';
import { UFile, upload } from '../files';
import express from 'express';
import path from 'path';
const router = express.Router();

const respond = <T>(promise: Promise<T>, res: express.Response, result: (data: T) => any = data => data) => {
    promise.then(data => res.send(result(data))).catch(err => res.json({ error: 'Error fetching data: ' + err }));
}

router.get('/categories', (_, res) => respond(DB.repo(Category).find({ order: { priority: 'ASC' } }), res, categories => categories.map(category => category.name)));
router.get('/pages', (_, res) => respond(DB.repo(Page).find(), res));
router.get('/tags', (_, res) => respond(DB.repo(Tag).find(), res));

router.get('/data', (_, res) => {
    respond(Promise.all([
        DB.crepo(CompetitionRepo).instance(),
        DB.repo(Category).find({ order: { priority: 'ASC' } }),
        DB.repo(Tag).find(),
        DB.repo(Page).find()
    ]), res, ([competition, categories, tags, pages]) => ({
        name: competition?.name || '',
        categories: categories,
        tags: tags,
        pages: pages
    }));
});

router.put('/save', (req, res) => {
    let data: Form = deserialize(req) as Form;
    if (!validForm(data)) return res.json({ error: 'Invalid data' });

    let uploads: Promise<void>[] = [];
    data.pages.forEach(page => {
        if (!page.html) return;
        page.source = `${page.path}/_page/${page.html.name}`;
        let dir = path.dirname('/client/public/pages' + page.source);
        uploads.push(upload(dir, page.html as UFile));
        if (!page.zip) return;
        uploads.push(upload(dir, page.zip as UFile)); // TODO: unzip
    });

    const error = (err: any, action: string): any => res.json({ error: `Error ${action}: ` + JSON.stringify(err) });
    Promise.all(uploads).then(() => Promise.all([
        DB.crepo(CompetitionRepo).setName(data.name),
        DB.setRepo(DB.repo(Category), data.categories.map(x => new Category(x.name, x.priority)), x => [x.name]),
        DB.setRepo(DB.repo(Tag), data.tags.map(x => new Tag(x.name, x.description)), x => [x.name]),
        DB.setRepo(DB.repo(Page), data.pages.map(x => new Page(x.name, x.path, x.source)), x => [x.path], x => [path.dirname(x.source)])
    ]).then(() => res.json({})).catch(err => error(err, 'saving'))).catch(err => error(err, 'uploading'));
});

export default { path: '/competition', router };
