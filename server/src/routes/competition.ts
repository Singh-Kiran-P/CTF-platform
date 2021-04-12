import DB, { Category, CompetitionRepo, Tag } from '../database';
import express from 'express';
const router = express.Router();

router.put('/save', (req, res) => {
    let data = req.body;
    Promise.all([ // TODO: store more than just the name
        DB.crepo(CompetitionRepo).setName(data.name)
    ]).then(() => res.send(''));
});

router.get('/data', (_, res) => {
    Promise.all([
        DB.crepo(CompetitionRepo).instance(),
        DB.repo(Category).find({ order: { priority: 'ASC' } }),
        DB.repo(Tag).find()
    ]).then(values => {
        res.json({
            name: values[0].name,
            categories: values[1].map(category => category.name),
            tags: values[2].map(tag => ({ name: tag.name, description: tag.description }))
        });
    });
});

export default { path: '/competition', router };
