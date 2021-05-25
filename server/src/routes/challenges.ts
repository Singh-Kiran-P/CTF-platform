import DB, { Challenge } from '../database';
import { getAccount, isAdmin, isAuth } from '../auth/index';
import express from 'express';
const router = express.Router();

const challengeAvailable = (challengeId: number | string, req: express.Request, res: express.Response, next: (challenge: Challenge) => any) => {
    let error = () => res.send({ error: 'Error fetching data' });
    DB.repo(Challenge).findOne({ where: { id: Number(challengeId) }, relations:
        ['round', 'hints', 'questions', 'solves', 'solves.team', 'solves.account', 'solves.usedHints', 'solves.usedHints.hint']
    }).then(challenge => {
        if (!challenge) return error();
        return next(challenge); // TODO: remove this line
        if (new Date(challenge.round.start) < new Date()) next(challenge);
        else isAdmin(req, res, (err: any) => err ? error() : next(challenge));
    }).catch(() => error());
}

router.get('/:id', isAuth, (req, res) => {
    challengeAvailable(req.params.id, req, res, challenge => {
        res.send(Object.assign({}, challenge, {
            flag: '',
            hints: challenge.hints.map(hint => Object.assign({}, hint, { content: '' })),
            questions: challenge.questions.map(question => Object.assign({}, question, { answer: '' })),
            solves: challenge.solves.filter(s => s.team.id == getAccount(req).team.id).map(s => ({
                name: s.account?.name || 'your team',
                points: s.usedHints.reduce((acc, cur) => Math.max(acc - cur.hint.cost, 0), challenge.points)
            }))
        }));
    });
});

export default { path: '/challenges', router };
