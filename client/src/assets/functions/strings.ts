// general functions for displaying values as strings

import { Round, Solve, ChallengeType } from '@shared/validation/roundsForm';

const solvePoints = (solves: Solve[]): string => { let p = solves.reduce((acc, cur) => Math.max(acc, cur.points), 0); return `${p} point${p == 1 ? '' : 's'}`; };
const solveNames = (solves: Solve[]): string => { return solves.reduce((acc, cur, i) => cur.name + (i == 1 ? ' and ' : (i == 0 ? '' : ', ')) + acc, ''); };

const typeName = (type: string): string => type == ChallengeType.INTERACTIVE ? 'Interactive' : (type == ChallengeType.QUIZ ? 'Quiz' : 'Basic');
const typeDescription = (type: string): string => {
    switch (type) {
        case ChallengeType.INTERACTIVE: return 'These challenges take place in an interactive environment within which you will have to find the flag in order to solve the challenge';
        case ChallengeType.QUIZ: return 'These challenges consist of a number of questions you have to answer correctly in order to solve the challenge';
        default: return 'These challenges require you to find a flag in order to solve the challenge';
    };
}

const durationDisplay = (round: Round): string => {
    let [start, end] = [round.start, round.end].map(time => new Date(time));
    let [startday, endday] = [start, end].map(time => time.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    let [starttime, endtime] = [start, end].map(time => time.toLocaleString('nl-BE', { hour: 'numeric', minute: 'numeric' }));
    return `${startday}, ${starttime} - ${startday == endday ? '' : endday + ', '}${endtime}`;
}

const countdownDisplay = (now: Date, round: Round): string => {
    let time = [round.start, round.end].map(time => new Date(time)).filter(t => t > now).concat([now])[0];
    return timerDisplay(Math.max(0, time.getTime() - now.getTime()));
}

const timerDisplay = (time: number, short?: boolean): string => {
    const amount = (t: number): number => {
        let a = Math.floor(time / t);
        time %= t;
        return a;
    }
    let [y, d, h, m, s] = [amount(1000 * 60 * 60 * 24 * 365), amount(1000 * 60 * 60 * 24), amount(1000 * 60 * 60), amount(1000 * 60), amount(1000)];
    const t = (amount: number, time: string) => `${amount} ${time}${amount == 1 ? '' : 's'}`;
    let large = (y ? `${t(y, 'year')}, ` : '') + (y || d ? `${t(d, 'day')}, ` : '') + (y || d ? t(h, 'hour') : '');
    return large || ((h ? h + 'h ' : '') + (m || !short ? m + 'm ' : '') + (s < 10 && !short ? '0' : '') + s + 's');
}

const timeDisplay = (time: string): string => {
    let date = new Date(time);
    let display = date.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return display + ', at ' + date.toLocaleString('nl-BE', { hour: 'numeric', minute: 'numeric', second: 'numeric' });
}

export { solvePoints, solveNames, typeName, typeDescription, durationDisplay, countdownDisplay, timerDisplay, timeDisplay };
