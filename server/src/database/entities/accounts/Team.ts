import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, Repository, AfterInsert } from 'typeorm';
import DB,{ Attempt, Solve, Account, UsedHint } from '../../../database';
import { generatePassword } from '../../../auth/index';
import { Category } from './Category';

@Entity()
export class Team {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({unique: true})
    name: string;

    @Column({nullable: true})
    inviteCode: string;

    @OneToOne(_ => Account)
    @JoinColumn()
    captain: Account;

    @OneToMany(_ => Account, account => account.team)
    @JoinColumn()
    accounts: Account[];

    @OneToMany(_ => UsedHint, usedHint => usedHint.team)
    usedHints: UsedHint[];

    @OneToMany(_ => Solve, solve => solve.team)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.team)
    attempts: Attempt[];

    @AfterInsert() 
    generateInvite() {
        let inviteData = generatePassword(this.id);
        DB.repo(Team).update(this.id, { inviteCode: inviteData.hash });
    }

    constructor(name: string, creator: Account) {
        this.name = name;
        if (!creator) return;
        this.captain = creator;
    }
    memberCount(): number {
        return this.accounts.length;
    }
    getPoints(): number {
        return this.solves.reduce((acc, cur) =>
            acc + Math.max(0, (cur.challenge.points - this.usedHints.filter(h => h.challenge.id == cur.challenge.id).reduce((acc, cur) => acc + cur.hint.cost, 0))), 0);
    }
    getCategory(): Category {
        let catOrder: number = this.accounts[0].category.order;
        let cat: Category = this.accounts[0].category;
        this.accounts.forEach(member => {
            if (member.category.order > catOrder) {
                catOrder = member.category.order;
                cat = member.category;
            }
        });
        return cat;
    }
    getCategoryName(): string {
        return this.getCategory().name;
    }
    getPlacement(): Promise<number> {
        return new Promise<number>(async (resolve, reject)=> {
            DB.repo(Team).find({relations: ['accounts', 'solves', 'solves.challenge', 'solves.challenge.usedHints', 'solves.challenge.usedHints.team']}).then((teamsDB: Team[]) => {
                let currentCat = this.getCategory();
                let currentPoints = this.getPoints();
                let placement = teamsDB.filter(t => t.id != this.id && t.getCategory().id == currentCat.id).reduce((acc, cur) => {
                    return cur.getPoints() > currentPoints ? acc + 1 : acc;
                }, 1);
                resolve(placement);
            }).catch((error)=>{reject(error);})
        });
    }
}

export class TeamRepoCustom extends Repository<Team> {
    //used for testdata
    saveWithCaptain(name: string, creator: Account, members: Account[]) {
        return new Promise<Team>(async (resolve, reject)=> {
            let newTeam: Team = new Team(name, creator);
            DB.repo(Team).save(newTeam).then((teamDB: Team) => {
                Promise.all([creator].concat(members).map(account => {
                    DB.repo(Account).update(account.id, { team: teamDB })
                })).then(() => resolve(teamDB)).catch(()=> reject("DB ERROR MEMBER"));
            }).catch(()=>{reject("DB ERROR TEAM");})
        });
    }
}
