import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Account, Challenge, Team } from '../../../database';

@Entity()
export class Solve {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Challenge, challenge => challenge.solves, { nullable: false })
    challenge: Challenge;

    @ManyToOne(_ => Team, team => team.solves, { nullable: false })
    team: Team;

    @ManyToOne(_ => Account, account => account.solves, { nullable: true })
    account: Account;

    @Column()
    time: string;

    constructor(challenge: Challenge, team: Team, time: string, account?: Account) {
        this.challenge = challenge;
        this.team = team;
        this.time = time;
        this.account = account;
    }
}
