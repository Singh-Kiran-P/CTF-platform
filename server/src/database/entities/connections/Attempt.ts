import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Team } from '../users/Team';
import { User } from '../users/User';

export enum AttemptTypes {
    LOGIN = 'login',
    SOLVE = 'solve'
}

@Entity()
export class Attempt {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(_ => User, user => user.attempts, { nullable: false })
    user: User;

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
