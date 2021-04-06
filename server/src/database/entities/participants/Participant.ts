import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Attempt } from '../connections/Attempt';
import { Solve } from '../connections/Solve';
import { Category } from './Category';
import { Team } from './Team';

@Entity()
export class Participant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @ManyToOne(_ => Category, category => category.participants, { nullable: false })
    category: Category;

    @ManyToOne(_ => Team, team => team.participants, { nullable: true })
    team: Team;

    @OneToMany(_ => Solve, solve => solve.participant)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.participant)
    attempts: Attempt[];

    constructor(name: string, password: string, category: Category) {
        this.name = name;
        this.setPassword(password);
        this.category = category;
        this.team = null;
    }

    setPassword(password: string) {
        this.salt = 'TODO: generate random salt';
        this.password = password;
        // TODO: generate random salt and hash password with it
    }
}
