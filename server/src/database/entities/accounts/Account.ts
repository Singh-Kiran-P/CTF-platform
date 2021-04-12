import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Attempt } from '../connections/Attempt';
import { Solve } from '../connections/Solve';
import { Category } from './Category';
import { Team } from './Team';
import  Roles  from './Roles';

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @Column()
    role: Roles;

    @ManyToOne(_ => Category, category => category.accounts, { nullable: true })
    category: Category;

    @ManyToOne(_ => Team, team => team.accounts, { nullable: true })
    team: Team;

    @OneToMany(_ => Solve, solve => solve.account)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.account)
    attempts: Attempt[];

    constructor(name: string, password: string, salt: string, role: Roles, category?: Category) {
        this.name = name;
        this.password = password;
        this.salt = salt;
        this.role = role;
        this.category = category;
        this.team = null;
    }

    isAdmin(): boolean {
        return this.role === Roles.admin;
    }
    

    /*setPassword(password: string) {
        this.salt = 'TODO: generate random salt';
        this.password = password;
        // TODO: generate random salt and hash password with it
    }*/
}
