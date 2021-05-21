import { validForm, Form, sortRounds, ChallengeType, Challenge as VChallenge, Hint as VHint, Question as VQuestion } from '@shared/validation/roundsForm';
import { createDir, uploadFiles, uploaddir, upload, fileName, chain, unzip } from '../files';
import DB, { Challenge, Hint, Question, Round } from '../database';
import { deserialize } from '@shared/objectFormdata';
import { isAdmin, isAuth } from '../auth/index';
import express from 'express';
const router = express.Router();

router.get('/data', isAuth, (_, res) => {
    DB.respond(DB.repo(Round).find(), res, rounds => ({ rounds: sortRounds(rounds.map(round => Object.assign({}, round, { challenges: undefined }))) }));
});

router.get('/challenges/:round', isAuth, (req, res) => {
    let error = () => res.send({ error: 'Error fetching data' });
    let respond = () => DB.respond(DB.repo(Challenge).find({ where: { round: req.params.round }, order: { order: 'ASC' }, relations: ['tag'] }), res);
    DB.repo(Round).findOne(req.params.round).then(round => {
        if (!round) return error();
        if (new Date(round.start) < new Date()) respond();
        else respond(); // TODO: REMOVE THIS DO THE FOLLOWING LINE INSTEAD
        // TODO: else isAdmin(req, res, (err: any) => err ? error() : respond());
    });
});

router.get('/challenge/hints/:challenge', isAdmin, (req, res) => DB.respond(DB.repo(Hint).find({ where: { challenge: req.params.challenge }, order: { order: 'ASC' } }), res));
router.get('/challenge/questions/:quiz', isAdmin, (req, res) => DB.respond(DB.repo(Question).find({ where: { quiz: req.params.quiz }, order: { order: 'ASC' } }), res));

router.put('/save', isAdmin, (req, res) => {
    let data: Form = deserialize(req) as Form;
    if (!validForm(data)) return res.json({ error: 'Invalid data' });

    let challengeUploads: Promise<void[]>[] = [];
    let [attachDir, dockerDir] = ['/attachment', '/docker'];
    const cfolder = (c: Challenge | VChallenge): string => (c.attachment || c.docker).split('/').filter(x => x).map(x => `/${x}`)[0] || '';
    const [attach, docker]: ((c: VChallenge) => boolean)[] = [c => Boolean(c.attachFile), c => Boolean(c.dockerFile) && c.type == ChallengeType.INTERACTIVE];
    const clears = (c: VChallenge): string[] => (attach(c) || !c.attachment ? [attachDir] : []).concat(docker(c) || c.type != ChallengeType.INTERACTIVE ? [dockerDir] : []);
    let roundUploads = uploadFiles(data.rounds, uploaddir, round => !Boolean(round.folder), _ => [''],
        round => `_${round.name}`, round => `/rounds/${round.name}`, round => round.folder,
        (_, dir) => createDir(dir), (round, dir, diff) => {
            if (diff) round.folder = dir;
            if (round.challenges) challengeUploads.push(uploadFiles(round.challenges, uploaddir + round.folder, c => clears(c).length > 0, c => clears(c),
                challenge => `_${challenge.name}`, challenge => `/${challenge.name}`, c => cfolder(c),
                (c, dir) => Promise.all([upload(dir + attachDir, c.attachFile),
                    docker(c) ? chain(() => upload(dir + dockerDir, c.dockerFile), () => unzip(`${dir + dockerDir}/${c.dockerFile.name}`)) : null]), (c, dir, diff) => {
                        if (attach(c) || (diff && c.attachment)) c.attachment = `${dir}${attachDir}/${c.attachFile?.name || fileName(c.attachment)}`;
                        if (docker(c) || (diff && c.docker)) c.docker = `${dir}${dockerDir}/${c.dockerFile?.name || fileName(c.docker)}`;
                        if (c.type != ChallengeType.INTERACTIVE) c.docker = '';
                }));
        });
    
    type ListsType = { hints: VHint[], questions: VQuestion[] };
    const error = (action: string): any => res.json({ error: `Error ${action}`});
    const lists = (c: ListsType): ListsType => ({ hints: c?.hints, questions: c?.questions });
    roundUploads.then(() => Promise.all(challengeUploads).then(() => {
        DB.setRepo(DB.repo(Round), data.rounds.map(x => new Round(x)), {}, x => [x.folder], true).then(rounds => {
            let challengeRounds = rounds.map(x => Object.assign({}, x, { challenges: data.rounds.find(y => y.name == x.name)?.challenges })).filter(x => x.challenges);
            if (challengeRounds.length == 0) res.send(); else challengeRounds.forEach(round => {
                let challenges = round.challenges.map(x => new Challenge(Object.assign({}, x, { round: round })));
                DB.setRepo(DB.repo(Challenge), challenges, { where: { round: round } }, x => cfolder(x) ? [uploaddir + round.folder + cfolder(x)] : [], true).then(challenges => {
                    challenges.map(x => Object.assign({}, x, lists(round.challenges.find(y => y.order == x.order)))).forEach(challenge => {
                        let hints = challenge.hints?.map(x => Object.assign({}, new Hint(x), { challenge: challenge }));
                        let questions = challenge.type == ChallengeType.QUIZ ? challenge.questions?.map(x => Object.assign({}, new Question(x), { quiz: challenge })) : [];
                        Promise.all([
                            hints == undefined ? null : DB.setRepo(DB.repo(Hint), hints, { where: { challenge: challenge } }),
                            questions == undefined ? null : DB.setRepo(DB.repo(Question), questions, { where: { quiz: challenge } })
                        ]).then(() => res.send()).catch(() => error('saving'));
                    });
                }).catch(() => error('saving'));
            });
        }).catch(() => error('saving'));
    }).catch(() => error('uploading'))).catch(() => error('uploading'));
});

export default { path: '/rounds', router };
