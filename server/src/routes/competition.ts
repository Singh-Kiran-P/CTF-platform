import DB, { Category, CompetitionRepo, Page, Tag } from '../database';
import express from 'express';
const router = express.Router();

import { validForm } from '@shared/validateCompetitionForm';

router.put('/save', (req, res) => {
    let data = req.body;
    if (!validForm(data)) return res.json({ error: 'Invalid form' });
    Promise.all([ // TODO: store more than just the name
        DB.crepo(CompetitionRepo).setName(data.name)
    ]).then(() => res.json({}));
});

router.get('/data', (_, res) => {
    Promise.all([
        DB.crepo(CompetitionRepo).instance(),
        DB.repo(Category).find({ order: { priority: 'ASC' } }),
        DB.repo(Tag).find(),
        DB.repo(Page).find()
    ]).then(values => {
        res.json({
            name: values[0]?.name || '',
            categories: values[1],
            tags: values[2],
            pages: values[3]
        });
    });
});

router.get('/pages', (_, res) => {
    DB.repo(Page).find().then(pages => res.send(pages));
});

export default { path: '/competition', router };
