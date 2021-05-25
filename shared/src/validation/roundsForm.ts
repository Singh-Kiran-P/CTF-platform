// functions to validate the rounds form

import { File as UFile } from 'formidable';
import { Tag, isf as iscf } from './competitionForm';
import { state, validInput, validateString, validateNumber, validateCharacters, validateList, is } from '../validation';

enum ChallengeType {
    QUIZ = 'quiz',
    BASIC = 'basic',
    INTERACTIVE = 'interactive'
}

type Solve = { name: string, points: number };
type Question = { question: string, answer: string, order: number };
type Hint = { name: string, content: string, cost: number, order: number };
type Challenge = { id?: number, round?: Round, name: string, description: string, tag: Tag | null, points: number, flag: string, order: number, type: ChallengeType,
    attachment: string, attachFile: File | UFile | null, hints: Hint[] | undefined, questions: Question[] | undefined, solves?: Solve[], lock: number,
    docker: string, dockerImageId: string, innerPorts: string, dockerFile: File | UFile | null };
type Round = { id? :number, name: string, folder: string, start: string, end: string, description: string, challenges: Challenge[] | undefined };
type Form = { rounds: Round[] };

const durationDisplay = (round: Round): string => {
    let [start, end] = [round.start, round.end].map(time => new Date(time));
    let [startday, endday] = [start, end].map(time => time.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    let [starttime, endtime] = [start, end].map(time => time.toLocaleString('nl-BE', { hour: 'numeric', minute: 'numeric' }));
    return `${startday}, ${starttime} - ${startday == endday ? '' : endday + ', '}${endtime}`;
}

const countdownDisplay = (round: Round): string => {
    let time = [round.start, round.end].map(time => new Date(time)).filter(t => t > new Date()).concat([new Date()])[0];
    let diff = Math.max(0, time.getTime() - new Date().getTime());
    const amount = (time: number): number => {
        let amount = Math.floor(diff / time);
        diff %= time;
        return amount;
    }
    let [y, d, h, m, s] = [amount(1000 * 60 * 60 * 24 * 365), amount(1000 * 60 * 60 * 24), amount(1000 * 60 * 60), amount(1000 * 60), amount(1000)];
    const t = (amount: number, time: string) => `${amount} ${time}${amount == 1 ? '' : 's'}`;
    let large = (y ? `${t(y, 'year')}, ` : '') + (y || d ? `${t(d, 'day')}, ` : '') + (y || d ? t(h, 'hour') : '');
    return large || ((h ? h + 'h ' : '') + m + 'm ' + (s < 10 ? '0' : '') + s + 's');
}

const sortRounds = (rounds: Round[]): Round[] => [...rounds].sort((a, b) => new Date(a.start) < new Date(b.start) ? -1 : 1);
const times = (round: Round) => [round.start, round.end].map(time => new Date(time).getTime());

const validForm = (f: Form): boolean => isf.form(f) && state(validate.rounds(f.rounds)) && f.rounds.every(r => state(validate.round(r, f.rounds)) && validChallenges(r.challenges, true));
const validChallenges = (cs?: Challenge[], create?: boolean): boolean => isf.challenges(cs) && state(validate.challenges(cs)) && (cs || []).every(c => validChallenge(c, cs, create));

const validChallenge = (c: Challenge, cs?: Challenge[], create?: boolean): boolean => {
    return isf.challenge(c) && state(validate.challenge(c, cs, create)) && validSolves(c.solves) && validHints(c.hints) && (c.type != ChallengeType.QUIZ || validQuestions(c.questions));
}

const validSolves = (solves?: Solve[]): boolean => isf.solves(solves);
const validHints = (hints?: Hint[]): boolean => isf.hints(hints) && state(validate.hints(hints)) && (hints || []).every(h => state(validate.hint(h)));
const validQuestions = (questions?: Question[]): boolean => isf.questions(questions) && state(validate.questions(questions)) && (questions || []).every(q => state(validate.question(q)));

const validate = {
    rounds: (rounds: Round[]): string => validateList(rounds, 'round', true),
    challenges: (challenges?: Challenge[]): string => challenges ? validateList(challenges, 'challenge', true) : '',
    hints: (hints?: Hint[]): string => hints ? validateList(hints, 'hint', false) : '',
    questions: (questions?: Question[]): string => questions ? validateList(questions, 'question', true) : '',

    round: (round: Round, rounds: Round[], add?: boolean): string => {
        let v = validateCharacters(round.name, 'Round name', true);
        if (!v) v = validateString(round.name, 'Round name', 3, 32, !add, rounds.map(r => r.name), !add);
        if (!v) v = validateString(round.start, 'Round start', -1, -1, !add);
        if (!v) v = validateString(round.end, 'Round end', -1, -1, !add);
        let [start, end] = times(round);
        if (!v && start >= end) v = 'Round must end after the round has started';
        sortRounds(rounds).forEach(other => {
            let [otherstart, otherend] = times(other);
            if (!add && start == otherstart && end == otherend) return;
            if (!v && start < otherstart && end > otherstart) v = 'Round must end before the next round starts';
            if (!v && start < otherend && otherstart < end) v = 'Round must start after the previous round has ended';
        });
        return v;
    },
    challenge: (challenge: Challenge, challenges?: Challenge[], create?: boolean, add?: boolean): string => { // TODO: flag not always required
        let v = validateCharacters(challenge.name, 'Challenge name', !add);
        if (!v) v = validateString(challenge.name, 'Challenge name', 3, 32, !add, (challenges || []).map(c => c.name), !add);
        if (!v) v = validateNumber(challenge.points, 'Challenge points', false);
        if (!v && create) v = validateString(challenge.flag, 'Challenge flag', -1, -1, !add);
        if (!v && challenge.lock >= 0 && challenges && !challenges.find(c => c.order == challenge.lock)) v = 'Challenge lock does not exist';
        if (!v && challenge.lock >= challenge.order) v = 'Challenge lock must be ordered before this challenge';
        if (challenge.type == ChallengeType.INTERACTIVE) {
            if (!v && !challenge.docker && !challenge.dockerFile) v = 'Interactive challenges require a docker file';
            if (!v && challenge.dockerFile && !challenge.dockerFile.name?.endsWith('.zip')) v = 'Challenge docker file must be contained in a .zip file';
            if (!v && !challenge.innerPorts) v = 'Interactive challenges require inner ports';
        }
        return v;
    },
    hint: (hint: Hint, add?: boolean): string => {
        let v = validateString(hint.name, 'Hint name', 3, 32, !add);
        if (!v) v = validateString(hint.content, 'Hint content', -1, -1, !add);
        return v || validateNumber(hint.cost, 'Hint cost', false);
    },
    question: (question: Question, add?: boolean): string => {
        let v = validateString(question.question, 'Quiz question', -1, -1, !add);
        return v || validateString(question.answer, 'Question answer', -1, -1, !add);
    }
}

const isf = {
    form: (form: any): boolean => {
        return is.object(form) && is.array(form.rounds, isf.round);
    },

    round: (round: any): boolean => {
        let v = is.object(round) && is.string(round.name) && is.string(round.folder) && is.string(round.description) && is.date(round.start) && is.date(round.end);
        return v && isf.challenges(round.challenges);
    },
    challenges: (challenges: any): boolean => challenges == undefined || is.array(challenges, isf.challenge),

    challenge: (challenge: any): boolean => {
        let v = is.object(challenge) && is.string(challenge.name) && is.string(challenge.description) && is.number(challenge.points) && is.string(challenge.flag);
        v = v && is.string(challenge.attachment) && is.string(challenge.docker) && is.number(challenge.order) && is.number(challenge.lock);
        return v && isf.tag(challenge.tag) && isf.type(challenge.type) && isf.hints(challenge.hints) && isf.questions(challenge.questions);
    },
    tag: (tag: any): boolean => tag == null || iscf.tag(tag),
    type: (type: any): boolean => type == ChallengeType.BASIC || type == ChallengeType.QUIZ || type == ChallengeType.INTERACTIVE,
    solves: (solves: any): boolean => solves == undefined || is.array(solves, isf.solve),
    hints: (hints: any): boolean => hints == undefined || is.array(hints, isf.hint),
    questions: (questions: any): boolean => questions == undefined || is.array(questions, isf.question),

    solve: (solve: any): boolean => {
        return is.object(solve) && is.string(solve.name) && is.number(solve.points);
    },
    hint: (hint: any): boolean => {
        return is.object(hint) && is.string(hint.name) && is.string(hint.content) && is.number(hint.cost) && is.number(hint.order);
    },
    question: (question: any): boolean => {
        return is.object(question) && is.string(question.question) && is.string(question.answer) && is.number(question.order);
    }
}

export {
    state, validInput, durationDisplay, countdownDisplay, sortRounds, validForm, validChallenges, validChallenge, validHints, validQuestions,
    validate, Solve, Question, Hint, Challenge, Round, Form, ChallengeType
};
