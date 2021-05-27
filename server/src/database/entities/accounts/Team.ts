import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, Repository, AfterInsert, BeforeUpdate, AfterUpdate } from 'typeorm';
import DB,{ Environment, Attempt, Solve, Account, UsedHint } from '../../../database';
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

    @OneToMany(_ => Solve, solve => solve.team)
    solves: Solve[];

    @OneToMany(_ => Attempt, attempt => attempt.team)
    attempts: Attempt[];

    @OneToMany(_ => Environment, environment => environment.team)
    environments: Environment[];

    @AfterInsert() 
    generateInvite() {
        let inviteData = generatePassword(this.id);
        DB.repo(Team).update(this.id, {inviteCode: inviteData.hash});
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
        var points: number = 0;
        this.solves.forEach((solve: Solve)=>{
            points += solve.challenge.points;
            solve.usedHints.forEach((usedHint: UsedHint)=>{
                points -= usedHint.hint.cost
            });
        });
        return points;
    }
    getCategory(): Category {
        let catOrder: number = this.accounts[0].category.order;
        let cat: Category = this.accounts[0].category;
        this.accounts.forEach((member: Account)=>{
            if(member.category.order > catOrder) {
                catOrder = member.category.order;
                cat = member.category;
            }
        });
        return cat;
    }
    getCategoryName(): string {
        return this.getCategory().name;
    }
}

export class TeamRepoCustom extends Repository<Team> {
    //used for testdata
    saveWithCaptain(name: string, creator: Account) {
        return new Promise<Team>(async (resolve, reject)=> {
            let newTeam: Team = new Team(name, creator);
            DB.repo(Team).save(newTeam).then((teamDB: Team) => {
                DB.repo(Account).update(creator.id, {team: teamDB}).then(() => {resolve(teamDB);}).catch(()=> {reject("DB ERROR MEMBER");})
            }).catch(()=>{reject("DB ERROR TEAM");})
        });
    }
}