import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, Repository, EntityRepository } from 'typeorm';
import DB,{ Environment, Attempt, Solve, Account } from '../../../database';

@Entity()
export class Team {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({unique: true})
    name: string;

    @OneToOne(_ => Account)
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
    }    

    public get memberCount(): number {
        console.log(this.accounts);
        return this.accounts.length;
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
        DB.repo(Team).findOne({where: {id: team.id}, relations:['accounts']}).then((t: Team)=>{console.log(t.memberCount); if(t.memberCount>4) return false;}).catch(()=>{return false;})
        account.team = team;
        DB.repo(Account).save(account).then(()=> {return true;}).catch(()=>{return false;});
        return true;
    }
}