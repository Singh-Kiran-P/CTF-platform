import { validForm, Form, sortRounds } from '@shared/validation/roundsForm';
import { createDir, uploadFiles, uploaddir } from '../files';
import { deserialize } from '@shared/objectFormdata';
import DB, { Challenge, Round } from '../database';
import { isAdmin } from '../auth/index';
import express from 'express';
const router = express.Router();

router.get('/data', isAdmin, (_, res) => {
    DB.respond(DB.repo(Round).find(), res, rounds => ({ rounds: sortRounds(rounds.map(round => Object.assign({}, round, { challenges: undefined }))) }));
});

router.get('/challenges/:round', isAdmin, (req, res) => {
    DB.respond(DB.repo(Challenge).find({ where: { round: req.params.round }, order: { order: 'ASC' } }), res);
});

router.put('/save', isAdmin, (req, res) => {
    let data: Form = deserialize(req) as Form;
    if (!validForm(data)) return res.json({ error: 'Invalid data' });

    let challengeUploads: Promise<void>[] = [];
    let roundUploads = uploadFiles(data.rounds, uploaddir, round => !Boolean(round.folder), round => `_${round.name}`,
        round => `/rounds/${round.name}`, round => round.folder.slice(0, -1),
        (_, dir) => createDir(dir), (round, dir) => round.folder = `${dir}/`, round => {
            if (round.challenges) challengeUploads.push(
                // TODO: uploadfiles round.challenges
            );
        });
    
    const error = (action: string): any => res.json({ error: `Error ${action}`});
    roundUploads.then(() => Promise.all(challengeUploads).then(() => {
        DB.setRepo(DB.repo(Round), data.rounds.map(x => new Round(x)), undefined, x => [x.folder.slice(0, -1)]).then(() => {
            DB.repo(Round).find().then(entries => {
                Promise.all(data.rounds.map(x => Object.assign({}, x, { id: x.id || entries.find(y => y.name == x.name).id })).filter(round => round.challenges).map(round => 
                    DB.setRepo(DB.repo(Challenge), round.challenges.map(x => new Challenge(Object.assign({}, x, { round: new Round(round) }))), { where: { round: round } }, x => [])
                )).then(() => res.send()).catch(() => error('saving'));
            }).catch(() => error('saving'));
        }).catch(() => error('saving'));
    }).catch(() => error('uploading'))).catch(() => error('uploading'));
});

export default { path: '/rounds', router };
