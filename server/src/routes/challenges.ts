import DB, { Challenge, Round, Solve, Question, Hint, UsedHint, Attempt, AttemptType, solveAvailable, Account, Team } from '../database';
import { getAccount, isAuth } from '../auth/index';
import { Root, uploaddir } from '../files';
import levenshtein from 'fast-levenshtein';
import express from 'express';
const router = express.Router();

const challengeRelations = ['solves', 'solves.team', 'solves.account', 'usedHints', 'usedHints.team'];

const error = (saving?: boolean) => ({ error: 'Error ' + (saving ? 'saving' : 'fetching data') });
const joinTeam = () => ({ error: 'Unauthorized request', joinTeam: true });
const notStarted = () => ({ error: 'Unauthorized request', notStarted: true });
const ended = () => ({ error: 'Unauthorized request', ended: true });
const locked = (id: number, name: string) => ({ error: 'Unauthorized request', locked: { id: id, name: name } });

const roundStarted = (roundId: number | string, req: express.Request, res: express.Response, next: (round: Round) => any) => {
    if (!getAccount(req).admin && !getAccount(req).team) return res.json(joinTeam());
    DB.repo(Round).findOne(roundId).then(round => {
        if (!round) return res.json(error());
        //if (new Date(round.start) > new Date()) return res.json(notStarted()); // TODO: uncomment
        return next(round);
    }).catch(() => res.json(error()));
}

const challengeAvailable = (challengeId: number | string, relations: string[], active: boolean, req: express.Request, res: express.Response, next: (challenge: Challenge) => any) => {
    if (!getAccount(req).admin && !getAccount(req).team) return res.json(joinTeam());
    DB.repo(Challenge).findOne({ where: { id: Number(challengeId) }, relations: challengeRelations.concat('round', ...relations) }).then(challenge => {
        if (!challenge) return res.json(error());
        //if (new Date(challenge.round.start) > new Date()) return res.json(notStarted()); // TODO: uncomment
        //if (active && new Date(challenge.round.end) < new Date()) return res.json(ended()); // TODO: uncomment
        if (challenge.questions) challenge.questions.sort((a, b) => a.order - b.order);
        if (challenge.hints) challenge.hints.sort((a, b) => a.order - b.order);
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
    points: challenge.usedHints.filter(h => h.team.id == solve.team?.id).reduce((acc, cur) => Math.max(acc - cur.hint.cost, 0), challenge.points),
    time: solve.time
});

const responseQuestion = (question: Question | undefined, unlocked: boolean) => {
    if (!question) return question;
    return Object.assign({}, question, { answer: '' }, unlocked ? {} : { id: -1, question: '' });
}

const responseChallenge = (req: express.Request, challenge: Challenge): any => Object.assign({}, challenge, {
    flag: '',
    solves: challenge.solves.filter(s => s.team.id == getAccount(req).team?.id).map(s => responseSolve(challenge, s))
});

router.get('/round/:id', isAuth, (req, res) => {
    roundStarted(req.params.id, req, res, round => {
        DB.respond(DB.repo(Challenge).find({ where: { round: round.id }, order: { order: 'ASC' }, relations: challengeRelations }), res, cs => cs.map(c => responseChallenge(req, c)));
    });
});

router.get('/:id', isAuth, (req, res) => {
    challengeAvailable(req.params.id, ['questions', 'hints'], false, req, res, challenge => {
        res.send(Object.assign({}, responseChallenge(req, challenge), {
            questions: challenge.questions.map((q, i) => responseQuestion(q, i == 0)),
            hints: challenge.hints.map(hint => Object.assign({}, hint, {
                content: challenge.usedHints.find(h => h.team.id == getAccount(req).team?.id && h.hint.id == hint.id) ? hint.content : ''
            }))
        }));
    });
});

router.get('/attachment/:id', isAuth, (req, res) => {
    challengeAvailable(req.params.id, [], false, req, res, challenge => {
        if (!challenge.round.folder || !challenge.attachment) return res.json(error());
        res.download(Root + uploaddir + challenge.round.folder + challenge.attachment);
    });
});

router.post('/solve/:id', isAuth, (req, res) => {
    let [account, team] = [getAccount(req), getAccount(req).team];
    solveAvailable(res, team, () => {
        challengeAvailable(req.params.id, [], true, req, res, challenge => {
            let correct = challenge.flag === req.fields.flag;
            if (account.admin) return res.send({ solved: correct ? new Solve(challenge, null, new Date().toJSON(), account) : false });
            if (challenge.solves.find(s => s.team.id == team.id)) return res.send({ solved: true });
            attempt(res, account, team, challenge, correct);
        });
    });
});

router.post('/answer/:id/:order', isAuth, (req, res) => {
    let [account, team] = [getAccount(req), getAccount(req).team];
    solveAvailable(res, team, () => {
        challengeAvailable(req.params.id, ['questions'], true, req, res, challenge => {
            let order = Number(req.params.order);
            let next = responseQuestion(challenge.questions.find(q => q.order > order), true);
            let correct = correctAnswer(challenge.questions.find(q => q.order == order), req.fields.answer as string);
            if (account.admin) return res.send(correct ? { solved: next ? true : new Solve(challenge, null, new Date().toJSON(), account), next: next } : { solve: false });
            if (challenge.solves.find(s => s.team.id == team.id)) return res.send({ solved: true });
            attempt(res, account, team, challenge, correct, next);
        });
    });
});

const attempt = (res: express.Response, account: Account, team: Team, challenge: Challenge, correct: boolean, next?: any): void => {
    DB.repo(Attempt).save(new Attempt(AttemptType.SOLVE, account, team)).then(attempt => {
        if (!attempt) res.json(error(true));
        if (!correct) return res.send({ solved: false });
        DB.repo(Attempt).delete({ team: team }).then(() => {
            if (next) return res.send({ solved: true, next: next });
            DB.repo(Solve).save(new Solve(challenge, team, new Date().toJSON(), account)).then(solve => {
                if (!solve) return res.json(error(true));
                // TODO leaderboard update
                res.send({ solved: responseSolve(challenge, solve) });
            }).catch(() => res.json(error(true)));
        }).catch(() => res.json(error(true)));
    }).catch(() => res.json(error(true)));
}

router.put('/hint/:id', isAuth, (req, res) => {
    let [account, team] = [getAccount(req), getAccount(req).team];
    DB.repo(Hint).findOne({ where: { id: req.params.id }, relations: ['challenge'] }).then(hint => {
        if (!hint) return res.json(error());
        challengeAvailable(hint.challenge.id, [], true, req, res, challenge => {
            if (account.admin) return res.send(hint.content);
            if (challenge.solves.find(s => s.team.id == team.id)) return res.json(ended());
            if (challenge.usedHints.find(h => h.team.id == team.id && h.hint.id == hint.id)) return res.send(hint.content);
            DB.repo(UsedHint).save(new UsedHint(hint, challenge, team)).then(usedHint => {
                if (!usedHint) return res.json(error(true));
                res.send(hint.content);
            }).catch(() => res.json(error(true)));
        });
    }).catch(() => res.json(error()));
});

const correctAnswer = (question: Question | undefined, answer: string): boolean => {
    if (!question) return false;
    answer = answer.toLowerCase();
    return question.answer.split(/\r?\n/).map(a => a.trim().toLowerCase()).filter(a => a).some(a => {
        let accuracy = (1 - levenshtein.get(answer, a, { useCollator: true }) / a.length) * 100;
        return answer == a || accuracy >= question.accuracy;
    });
}

export default { path: '/challenges', router };
