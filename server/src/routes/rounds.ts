import { validForm, Form, sortRounds } from '@shared/validation/roundsForm';
import { createDir, uploadFiles, uploaddir, upload, parentDir, fileName } from '../files';
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

    let cfolder = (c: { attachments: string /* TODO: , other: string */ }): string => parentDir(c.attachments /* TODO: || c.other */, 2); // TODO: safer?
    let challengeUploads: Promise<void[]>[] = [];
    let roundUploads = uploadFiles(data.rounds, uploaddir, round => !Boolean(round.folder), _ => [''],
        round => `_${round.name}`, round => `/rounds/${round.name}`, round => round.folder,
        (_, dir) => createDir(dir), (round, dir, diff) => {
            if (diff) round.folder = dir;
            if (round.challenges) {
                let [zipDir, otherDir] = ['/attachments', '/other'];
                let [zip, other]: ((c: typeof round.challenges[0]) => boolean)[] = [c => Boolean(c.zip), c => false]; // TODO: Boolean(c.other)
                challengeUploads.push(uploadFiles(round.challenges, uploaddir + round.folder, c => zip(c) || other(c), c => (zip(c) ? [zipDir] : []).concat(other(c) ? [otherDir] : []),
                challenge => '_' + challenge.name, challenge => `/${challenge.name}`, c => cfolder(c),
                (c, dir) => Promise.all([upload(dir + zipDir, c.zip) /* TODO: , upload(dir + otherDir, c.other) */]), (c, dir, diff) => {
                    if (zip(c) || (diff && c.attachments)) c.attachments = `${dir}${zipDir}/${c.zip?.name || fileName(c.attachments)}`;
                    // TODO: if (other(c) || (diff && c.other)) c.other = `${dir}${otherDir}/${c.other?.name || fileName(c.other)}`;
                }));
            }
        });
    
    const error = (action: string): any => res.json({ error: `Error ${action}`});
    roundUploads.then(() => Promise.all(challengeUploads).then(() => {
        DB.setRepo(DB.repo(Round), data.rounds.map(x => new Round(x)), {}, x => [x.folder]).then(() => {
            DB.repo(Round).find().then(rounds => {
                Promise.all(rounds.map(x => Object.assign({}, x, { challenges: data.rounds.find(y => y.name == x.name)?.challenges })).filter(round => round.challenges).map(round => {
                    let challenges = round.challenges.map(x => new Challenge(Object.assign({}, x, { round: round })));
                    DB.setRepo(DB.repo(Challenge), challenges, { where: { round: round } }, x => cfolder(x) ? [uploaddir + round.folder + cfolder(x)] : []);
                })).then(() => res.send()).catch(() => error('saving'));
            }).catch(() => error('saving'));
        }).catch(() => error('saving'));
    }).catch(() => error('uploading'))).catch(() => error('uploading'));
});

export default { path: '/rounds', router };
