import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Attempt, Solve, Category, Team } from '../../../database';
import { generatePassword } from '../../../auth';

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @Column()
    admin: boolean;

    @ManyToOne(_ => Category, category => category.accounts, { nullable: true, onDelete: 'CASCADE', eager: true })
    category: Category;

    @ManyToOne(_ => Team, team => team.accounts, { nullable: true, onDelete: 'SET NULL', eager: true })
    @JoinColumn()
    team: Team;

    @OneToMany(_ => Solve, solve => solve.account)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.account)
    attempts: Attempt[];

    constructor(name: string, password: string, category?: Category) {
        this.name = name;
        this.category = category;
        this.admin = false;
        this.team = null;
        
        if (!password) return;
        let pass = generatePassword(password);
        this.password = pass.hash;
        this.salt = pass.salt;
    }

    getPoints(): number {
        return this.solves.reduce((acc, cur) =>
            acc + Math.max(0, (cur.challenge.points - this.team.usedHints.filter(h => h.challenge.id == cur.challenge.id).reduce((acc, cur) => acc + cur.hint.cost, 0))), 0);
    }
}
