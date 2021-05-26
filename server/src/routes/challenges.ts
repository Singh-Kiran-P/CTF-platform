import DB, { Challenge, Round } from '../database';
import { getAccount, isAuth } from '../auth/index';
import express from 'express';
const router = express.Router();

let error = () => ({ error: 'Error fetching data' });
let joinTeam = () => ({ error: 'Unauthorized request', joinTeam: true });
let notStarted = () => ({ error: 'Unauthorized request', notStarted: true });
let locked = (id: number, name: string) => ({ error: 'Unauthorized request', locked: { id: id, name: name } });

const roundStarted = (roundId: number | string, req: express.Request, res: express.Response, next: (round: Round) => any) => {
    if (!getAccount(req).admin && !getAccount(req).team) return res.send(joinTeam());
    DB.repo(Round).findOne(roundId).then(round => {
        if (!round) return res.send(error());
        //if (new Date(round.start) > new Date()) return res.send(notStarted()); // TODO: uncomment
        return next(round);
    }).catch(() => res.send(error()));
}

const challengeAvailable = (challengeId: number | string, req: express.Request, res: express.Response, next: (challenge: Challenge) => any) => {
    if (!getAccount(req).admin && !getAccount(req).team) return res.send(joinTeam());
    DB.repo(Challenge).findOne({ where: { id: Number(challengeId) }, relations:
        ['round', 'hints', 'questions', 'solves', 'solves.team', 'solves.account', 'solves.usedHints']
    }).then(challenge => {
        if (!challenge) return res.send(error());
        //if (new Date(challenge.round.start) > new Date()) return res.send(notStarted()); // TODO: uncomment
        const available = () => next(responseChallenge(req, challenge));
        if (challenge.lock < 0) return available();
        DB.repo(Challenge).findOne({ where: { round: challenge.round, order: challenge.lock }, relations: ['solves'] }).then(c => {
            if (!c) return res.send(error());
            if (c.solves.findIndex(s => s.team.id == getAccount(req).team.id) < 0) return res.send(locked(c.id, c.name));
            return available();
        }).catch(() => res.send(error()));
    }).catch(() => res.send(error()));
}

const responseChallenge = (req: express.Request, challenge: Challenge): any => Object.assign({}, challenge, {
    flag: '',
    solves: challenge.solves.filter(s => s.team.id == getAccount(req).team.id).map(s => ({
        name: s.account?.name || 'your team',
        points: s.usedHints.reduce((acc, cur) => Math.max(acc - cur.hint.cost, 0), challenge.points)
    }))
});

router.get('/round/:id', isAuth, (req, res) => {
    roundStarted(req.params.id, req, res, round => {
        DB.respond(DB.repo(Challenge).find({ where: { round: round.id }, order: { order: 'ASC' }, relations: ['solves'] }), res, cs => cs.map(c => responseChallenge(req, c)));
    });
});

router.get('/:id', isAuth, (req, res) => {
    challengeAvailable(req.params.id, req, res, challenge => {
        res.send(Object.assign({}, challenge, {
            hints: challenge.hints.map(hint => Object.assign({}, hint, { content: '' })),
            questions: challenge.questions.map(question => Object.assign({}, question, { answer: '' }))
        }));
    });
});

export default { path: '/challenges', router };
