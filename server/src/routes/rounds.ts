import { sortRounds } from '@shared/validation/roundsForm';
import DB, { Challenge, Round } from '../database';
import { isAdmin } from '../auth/index';
import express from 'express';
const router = express.Router();

// TODO

router.get('/data', isAdmin, (_, res) => {
    DB.respond(DB.repo(Round).find(), res, rounds => ({ rounds: sortRounds(rounds.map(round => Object.assign({}, round, { challenges: undefined }))) }));
});

router.get('/challenges/:round', isAdmin, (req, res) => {
    DB.respond(DB.repo(Challenge).find({ where: { round: req.params.round }, order: { order: 'ASC' } }), res);
});

router.put('/save', isAdmin, (req, res) => {
    // TODO
    res.send();
});

export default { path: '/rounds', router };
