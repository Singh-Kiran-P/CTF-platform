import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import DB, { Account, Team } from '../../../database';
import express from 'express';

export enum AttemptType {
    LOGIN = 'login',
    SOLVE = 'solve'
}

@Entity()
export class Attempt {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: AttemptType })
    type: AttemptType;

    @ManyToOne(_ => Account, account => account.attempts, { nullable: false, onDelete: 'CASCADE' })
    account: Account;

    @ManyToOne(_ => Team, team => team.attempts, { nullable: true, onDelete: 'CASCADE' })
    team: Team;

    @Column()
    time: string;

    constructor(type: AttemptType, account: Account, team?: Team) {
        this.type = type;
        this.account = account;
        this.team = team;
        this.time = new Date().toJSON();
    }
}

const bucketSize = 10;
const rechargeTime = 30 * 1000;

const error = (saving?: boolean) => ({ error: 'Error ' + (saving ? 'saving' : 'fetching data') });
const rateLimit = (time: number) => ({ error: 'Unauthorized request', rateLimit: time });

const available = (res: express.Response, attempts: Attempt[], next: () => any) => {
    let now = new Date().getTime();
    let buckets = bucketSize;
    let rechargeEnd = 0;
    attempts.map(a => Object.assign({}, a, { diff: now - new Date(a.time).getTime(), timestamp: new Date(a.time).getTime() })).sort((a, b) => b.diff - a.diff).forEach(attempt => {
        let rechargeStart = Math.max(rechargeEnd, attempt.timestamp);
        if (rechargeStart < now) rechargeEnd = rechargeStart + rechargeTime;
        if (rechargeEnd > now) --buckets;
    });

    DB.repo(Attempt).remove(attempts.filter(a => new Date(a.time).getTime() < now - bucketSize * rechargeTime)).then(() => {
        buckets > 0 ? next() : res.json(rateLimit(rechargeEnd));
    }).catch(() => res.send(error(true)));
}

export const loginAvailable = (res: express.Response, account: any, next: () => any): void => {
    next(); // TODO: user ip is needed to rate limit logins
}

export const solveAvailable = (res: express.Response, team: Team, next: () => any): void => {
    if (!team) return next();
    DB.repo(Attempt).find({ where: { type: AttemptType.SOLVE, team: team } }).then(attempts => {
        available(res, attempts, () => next());
    }).catch(() => res.json(error()));
}
