import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Challenge } from '../challenges/Challenge';
import { UsedHint } from './UsedHint';
import { Team } from '../users/Team';
import { User } from '../users/User';

@Entity()
export class Solve {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => Team, team => team.solves, { nullable: false })
    team: Team;

    @ManyToOne(_ => User, user => user.solves, { nullable: true })
    user: User;

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
