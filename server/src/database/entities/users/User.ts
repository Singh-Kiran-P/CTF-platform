import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Attempt } from '../connections/Attempt';
import { Solve } from '../connections/Solve';
import { Category } from './Category';
import { Team } from './Team';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @ManyToOne(_ => Category, category => category.users, { nullable: false })
    category: Category;

    @ManyToOne(_ => Team, team => team.members, { nullable: true })
    team: Team;

    @OneToMany(_ => Solve, solve => solve.user)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.user)
    attempts: Attempt[];

    constructor() {
        // TODO
    }
}
