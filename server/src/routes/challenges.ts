import DB, { Challenge, Round, Solve, Hint, UsedHint } from '../database';
import { getAccount, isAuth } from '../auth/index';
import { Root, uploaddir } from '../files';
import express from 'express';
const router = express.Router();

const challengeRelations = ['solves', 'solves.team', 'solves.account', 'usedHints', 'usedHints.team'];

let error = (saving?: boolean) => ({ error: 'Error ' + (saving ? 'saving' : 'fetching data') });
let joinTeam = () => ({ error: 'Unauthorized request', joinTeam: true });
let notStarted = () => ({ error: 'Unauthorized request', notStarted: true });
let ended = () => ({ error: 'Unauthorized request', ended: true });
let locked = (id: number, name: string) => ({ error: 'Unauthorized request', locked: { id: id, name: name } });

const roundStarted = (roundId: number | string, req: express.Request, res: express.Response, next: (round: Round) => any) => {
    if (!getAccount(req).admin && !getAccount(req).team) return res.json(joinTeam());
    DB.repo(Round).findOne(roundId).then(round => {
        if (!round) return res.json(error());
        //if (new Date(round.start) > new Date()) return res.json(notStarted()); // TODO: uncomment
        return next(round);
    }).catch(() => res.json(error()));
}

const challengeAvailable = (challengeId: number | string, active: boolean, req: express.Request, res: express.Response, next: (challenge: Challenge) => any) => {
    if (!getAccount(req).admin && !getAccount(req).team) return res.json(joinTeam());
    DB.repo(Challenge).findOne({ where: { id: Number(challengeId) }, relations: challengeRelations.concat(['round', 'hints']) }).then(challenge => {
        if (!challenge) return res.json(error());
        //if (new Date(challenge.round.start) > new Date()) return res.json(notStarted()); // TODO: uncomment
        //if (active && new Date(challenge.round.end) < new Date()) return res.json(ended()); // TODO: uncomment
        const available = () => next(challenge);
        if (challenge.lock < 0 || getAccount(req).admin) return available();
        DB.repo(Challenge).findOne({ where: { round: challenge.round, order: challenge.lock }, relations: ['solves', 'solves.team'] }).then(c => {
            if (!c) return res.json(error());
            if (!c.solves.find(s => s.team.id == getAccount(req).team.id)) return res.json(locked(c.id, c.name));
            return available();
        }).catch(() => res.json(error()));
    }).catch(() => res.json(error()));
}

const responseSolve = (challenge: Challenge, solve: Solve): any => ({
    name: solve.account?.name || solve.team.name,
    points: challenge.usedHints.filter(h => h.team.id == solve.team.id).reduce((acc, cur) => Math.max(acc - cur.hint.cost, 0), challenge.points),
    time: solve.time
});

const responseChallenge = (req: express.Request, challenge: Challenge): any => Object.assign({}, challenge, {
    flag: '',
    solves: challenge.solves.filter(s => s.team.id == getAccount(req).team.id).map(s => responseSolve(challenge, s))
});

router.get('/round/:id', isAuth, (req, res) => {
    roundStarted(req.params.id, req, res, round => {
        DB.respond(DB.repo(Challenge).find({ where: { round: round.id }, order: { order: 'ASC' }, relations: challengeRelations }), res, cs => cs.map(c => responseChallenge(req, c)));
    });
});

router.get('/:id', isAuth, (req, res) => {
    challengeAvailable(req.params.id, false, req, res, challenge => {
        res.send(Object.assign({}, responseChallenge(req, challenge), {
            hints: challenge.hints.sort((a, b) => a.order - b.order).map(hint => Object.assign({}, hint, {
                content: challenge.usedHints.find(h => h.team.id == getAccount(req).team.id && h.hint.id == hint.id) ? hint.content : ''
            }))
        }));
    });
});

router.get('/attachment/:id', isAuth, (req, res) => {
    challengeAvailable(req.params.id, false, req, res, challenge => {
        if (!challenge.round.folder || !challenge.attachment) return res.json(error());
        res.download(Root + uploaddir + challenge.round.folder + challenge.attachment);
    });
});

router.put('/solve/:id/:flag', isAuth, (req, res) => {
    // TODO: rate limit
    challengeAvailable(req.params.id, true, req, res, challenge => {
        let [account, team] = [getAccount(req), getAccount(req).team];
        if (!team) return res.json(joinTeam());
        if (challenge.solves.find(s => s.team.id == team.id)) return res.json({ solved: true });
        // TODO: create attempt
        if (challenge.flag !== req.params.flag) return res.json({ solved: false });
        DB.repo(Solve).save(new Solve(challenge, team, new Date().toJSON(), account)).then(solve => {
            if (!solve) return res.json(error(true));
            res.json({ solved: responseSolve(challenge, solve) });
        }).catch(() => res.json(error(true)));
    });
});

router.put('/hint/:id', isAuth, (req, res) => {
    DB.repo(Hint).findOne({ where: { id: req.params.id }, relations: ['challenge'] }).then(hint => {
        let team = getAccount(req).team;
        if (!hint) return res.json(error());
        if (!team) return res.json(joinTeam());
        challengeAvailable(hint.challenge.id, true, req, res, challenge => {
            if (challenge.usedHints.find(h => h.team.id == team.id && h.hint.id == hint.id)) return res.json({ error: 'Hint already used' });
            DB.repo(UsedHint).save(new UsedHint(hint, challenge, team)).then(usedHint => {
                if (!usedHint) return res.json(error(true));
                res.send(hint.content);
            }).catch(() => res.json(error(true)));
        });
    }).catch(() => res.json(error()));
});

export default { path: '/challenges', router };
