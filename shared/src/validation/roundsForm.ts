// functions to validate the rounds form

import { File as UFile } from 'formidable';
import { state, validInput, validateString, is } from '../validation';

type Challenge = { name: string, attachments: string, zip: File | UFile | null }; // TODO
type Round = { name: string, start: string, end: string, challenges: Challenge[] };
type Form = { rounds: Round[] };

const sortRounds = (rounds: Round[]): Round[] => [...rounds].sort((a, b) => new Date(a.start) < new Date(b.start) ? -1 : 1);
const times = (round: Round) => [round.start, round.end].map(time => new Date(time).getTime());

const validForm = (f: Form, checkType: boolean = true): boolean => {
    let valid = (!checkType || isf.form(f)) && state(validate.rounds(f.rounds));
    return valid && f.rounds.every(r => state(validate.round(r, f.rounds), validate.challenges(r.challenges)) && r.challenges.every(c => state(validate.challenge(c, r.challenges))));
}

const validate = {
    rounds: (rounds: Round[]): string => {
        return rounds.length == 0 ? 'At least one round is required' : '';
    },
    challenges: (challenges: Challenge[]): string => {
        let v = '';
        // TODO
        return v;
    },

    round: (round: Round, rounds: Round[], add: boolean = false): string => {
        let v = validateString(round.name, 'Round name', 3, 32, !add);
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
    challenge: (challenge: Challenge, challenges: Challenge[], add: boolean = false): string => {
        let v = '';
        // TODO
        return v;
    }
}

const isf = {
    form: (form: any): boolean => {
        return is.object(form) && is.array(form.rounds, isf.round);
    },
    round: (round: any): boolean => {
        return is.object(round) && is.string(round.name) && is.date(round.start) && is.date(round.end) && is.array(round.challenges, isf.challenge)
    },
    challenge: (challenge: any): boolean => {
        return is.object(challenge); // TODO
    }
}

export { state, validInput, validateString, sortRounds, validForm, validate, Challenge, Round, Form };
