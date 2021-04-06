import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Participant } from '../participants/Participant';
import { Team } from '../participants/Team';

export enum AttemptTypes {
    LOGIN = 'login',
    SOLVE = 'solve'
}

@Entity()
export class Attempt {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Participant, participant => participant.attempts, { nullable: false })
    participant: Participant;

    @ManyToOne(_ => Team, team => team.attempts, { nullable: true })
    team: Team;

    @Column({ type: 'enum', enum: AttemptTypes })
    type: AttemptTypes;

    @Column()
    timestamp: number;

    constructor() {
        // TODO
    }
}
