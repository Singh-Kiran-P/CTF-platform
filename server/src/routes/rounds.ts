import DB, { Round } from '../database';
import { isAdmin } from '../auth/index';
import express from 'express';
const router = express.Router();

// TODO

router.get('/data', isAdmin, (req, res) => {
    DB.respond(DB.repo(Round).find({ relations: ['challenges'] }), res, rounds => ({ rounds: rounds }));
});

router.put('/save', isAdmin, (req, res) => {
    // TODO
    res.send();
});

export default { path: '/rounds', router };
