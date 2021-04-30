// functions to validate the rounds form

import { File as UFile } from 'formidable';
import { state, validInput, validateString, is } from '../validation';

type Challenge = { name: string, attachments: string, zip: File | UFile | null }; // TODO
type Round = { name: string, start: string, end: string, challenges: Challenge[] };
type Form = { rounds: Round[] };

const validForm = (f: Form, checkType: boolean = true): boolean => {
    let valid = (!checkType || isf.form(f)) && state(validate.rounds(f.rounds));
    return valid && f.rounds.every(r => state(validate.round(r), validate.challenges(r.challenges)) && r.challenges.every(c => state(validate.challenge(c))));
}

const validate = {
    rounds: (rounds: Round[]): string => {
        let v = '';
        // TODO
        return v;
    },
    challenges: (challenges: Challenge[]): string => {
        let v = '';
        // TODO
        return v;
    },

    round: (round: Round): string => {
        let v = '';
        // TODO
        return v;
    },
    challenge: (challenge: Challenge): string => {
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

export { state, validInput, validateString, validForm, validate, Challenge, Round, Form };
