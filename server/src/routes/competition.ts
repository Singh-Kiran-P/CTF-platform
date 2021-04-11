import express from 'express';
import DB from '../database';
const router = express.Router();

router.put('/save', (req, res) => {
    let data = req.body;
    console.log(JSON.stringify(data));
    // TODO: verify and save data, only then send response
    res.send('');
});

router.get('/data', (_, res) => {
    res.json({ // TODO: load and then send data
        name: '',
        categories: [],
        tags: []
    });
});

export default { path: '/competition', router };
