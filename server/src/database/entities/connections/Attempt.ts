import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Account, Team } from '../../../database';

export enum AttemptType {
    LOGIN = 'login',
    SOLVE = 'solve'
}

@Entity()
export class Attempt {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Account, account => account.attempts, { nullable: false })
    account: Account;

    @ManyToOne(_ => Team, team => team.attempts, { nullable: true })
    team: Team;

    @Column({ type: 'enum', enum: AttemptType })
    type: AttemptType;

    @Column()
    timestamp: number;

    constructor() {
        // TODO
    }
}
