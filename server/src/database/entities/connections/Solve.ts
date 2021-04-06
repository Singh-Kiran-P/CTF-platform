import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Participant } from '../participants/Participant';
import { Challenge } from '../challenges/Challenge';
import { Team } from '../participants/Team';
import { UsedHint } from './UsedHint';

@Entity()
export class Solve {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Team, team => team.solves, { nullable: false })
    team: Team;

    @ManyToOne(_ => Participant, participant => participant.solves, { nullable: true })
    participant: Participant;

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
