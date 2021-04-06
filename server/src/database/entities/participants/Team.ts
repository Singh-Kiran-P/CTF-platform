import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Environment } from '../connections/Environment';
import { Attempt } from '../connections/Attempt';
import { Solve } from '../connections/Solve';
import { Participant } from './Participant';

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(_ => Participant, participant => participant.team)
    participants: Participant[];

    @OneToMany(_ => Solve, solve => solve.participant)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.participant)
    attempts: Attempt[];

    @OneToMany(_ => Environment, environment => environment.team)
    environments: Environment[];

    constructor(name: string, owner: Participant) {
        this.name = name;
        // TODO: set owner and update owners team in database
    }
}
