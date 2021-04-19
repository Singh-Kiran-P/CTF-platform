import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Environment } from '../connections/Environment';
import { Attempt } from '../connections/Attempt';
import { Solve } from '../connections/Solve';
import { Account } from './Account';
import { serializeUser } from 'passport';

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
        this.captain = creator;
        //creator.team = this;
        //this.accounts.push(creator);
    }

    memberCount(): number {
        return this.accounts.length;
    }

    addUser(account: Account) {
        account.team = this;
        //this.accounts.push(account);
    }
}
