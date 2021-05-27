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

    /*@OneToOne(_ => Category)
    @JoinColumn()
    category: Category;*/

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

    @OneToMany(_ => Environment, environment => environment.team)
    environments: Environment[];

    @AfterInsert() 
    generateInvite() {
        let inviteData = generatePassword(this.id);
        DB.repo(Team).update(this.id, {inviteCode: inviteData.hash});
    }

    /*@AfterUpdate()
    updateCategory() {
        let cat: Category = this.getCategory();
        if (cat != this.category)
            DB.repo(Team).update(this.id, {category: cat});
    }*/

    constructor(name: string, creator: Account) {
        this.name = name;
        if (!creator) return;
        this.captain = creator;
        //this.category = creator.category;
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

//Ik moet hier volgens mij async functies met promises
export class TeamRepoCustom extends Repository<Team> {
    //used for testdata
    saveWithCaptain(name: string, creator: Account): Team {
        let newTeam: Team = new Team(name, creator);
        DB.repo(Team).save(newTeam).then((teamDB: Team) => {
            DB.repo(Account).update(creator.id, {team: teamDB}).then(() => {return teamDB;}).catch(()=> {return null;})
        }).catch(()=>{return null;})
        return null;
    }
    //werkt niet
    public addUserToTeam(team:Team, account: Account): boolean {
        console.log('ENTERED');
        console.log(team);
        console.log(account);
        if(!team || !account) return false;
        console.log('passed');
        ///DB.repo(Team).findOne({where: {id: team.id}, relations:['accounts']}).then((t: Team)=>{console.log(t.memberCount); if(t.memberCount>4) return false;}).catch(()=>{return false;})
        //DB.repo(Team).findOne({where: {id: team.id}, relations:['accounts']}).then((t: Team)=>{console.log(t.memberCount); if(t.memberCount>4) return false;}).catch(()=>{return false;})
        account.team = team;
        DB.repo(Account).save(account).then(()=> {return true;}).catch(()=>{return false;});
        return true;
    }
}