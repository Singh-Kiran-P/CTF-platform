import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Environment, Attempt, Solve, Account } from '../../../database';

@Entity()
export class Team {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({unique: true})
    name: string;

    @OneToMany(_ => Account, account => account.team)
    accounts: Account[];

    @OneToMany(_ => Solve, solve => solve.team)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.team)
    attempts: Attempt[];

    @OneToMany(_ => Environment, environment => environment.team)
    environments: Environment[];

    constructor(name: string) {
        this.name = name;
        // TODO: owner?
    }
}
