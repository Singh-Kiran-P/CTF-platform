import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Environment, Attempt, Solve, Account } from '../../../database';

@Entity()
export class Team {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({unique: true})
    name: string;

    @OneToOne(() => Account)
    @JoinColumn()
    captain: Account;

    @OneToMany(_ => Account, account => account.team)
    accounts: Account[];

    @OneToMany(_ => Solve, solve => solve.account)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.account)
    attempts: Attempt[];

    @OneToMany(_ => Environment, environment => environment.team)
    environments: Environment[];

    constructor(name: string, creator: Account) {
        this.name = name;
        if (!creator) return;
        this.captain = creator;
        //creator.team = this; //TODO UPDATE IN DB
    }

    memberCount(): number {
        return this.accounts.length;
    }

    addUser(account: Account) {
        account.team = this;
        //this.accounts.push(account);
    }
}
