import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Account } from '../accounts/Account';
import { Challenge } from '../challenges/Challenge';
import { Team } from '../accounts/Team';
import { UsedHint } from './UsedHint';

@Entity()
export class Solve {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Team, team => team.solves, { nullable: false })
    team: Team;

    @ManyToOne(_ => Account, account => account.solves, { nullable: true })
    account: Account;

    @ManyToOne(_ => Challenge, challenge => challenge.solves, { nullable: false })
    challenge: Challenge;

    @OneToMany(_ => UsedHint, usedHint => usedHint.solve)
    usedHints: UsedHint[];

    @Column()
    timestamp: number;

    constructor() {
        // TODO
    }
}
