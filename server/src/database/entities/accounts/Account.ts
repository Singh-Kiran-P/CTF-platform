import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Attempt } from '../connections/Attempt';
import { Solve } from '../connections/Solve';
import { Category } from './Category';
import { Team } from './Team';

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @ManyToOne(_ => Category, category => category.accounts, { nullable: true })
    category: Category;

    @ManyToOne(_ => Team, team => team.accounts, { nullable: true })
    team: Team;

    @OneToMany(_ => Solve, solve => solve.account)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.account)
    attempts: Attempt[];

    constructor(name: string, password: string, category: Category) {
        this.name = name;
        this.setPassword(password);
        this.category = category;
        this.team = null;
    }

    admin(): boolean {
        return !this.category;
    }

    setPassword(password: string) {
        this.salt = 'TODO: generate random salt';
        this.password = password;
        // TODO: generate random salt and hash password with it
    }
}
