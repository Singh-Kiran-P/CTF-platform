import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Environment } from '../connections/Environment';
import { Attempt } from '../connections/Attempt';
import { Solve } from '../connections/Solve';
import { Account } from './Account';

@Entity()
export class Team {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({unique: true})
    name: string;

    @OneToMany(_ => Account, account => account.team)
    accounts: Account[];

    @OneToMany(_ => Solve, solve => solve.account)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.account)
    attempts: Attempt[];

    @OneToMany(_ => Environment, environment => environment.team)
    environments: Environment[];

    constructor(name: string) {
        this.name = name;
        // TODO: owner?
    }
}
