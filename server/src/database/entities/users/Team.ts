import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Environment } from '../connections/Environment';
import { Attempt } from '../connections/Attempt';
import { Solve } from '../connections/Solve';
import { User } from './User';

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(_ => User, user => user.team)
    members: User[];

    @OneToMany(_ => Solve, solve => solve.user)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.user)
    attempts: Attempt[];

    @OneToMany(_ => Environment, environment => environment.team)
    environments: Environment[];

    constructor() {
        // TODO
    }
}
