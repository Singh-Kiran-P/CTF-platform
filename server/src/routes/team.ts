import express from 'express';
const router = express.Router();
import DB, { Team, Account, Category, Solve, Hint, UsedHint } from '../database';
import TeamRepoCustom from '../database';
import { isAuth, hasTeam, getAccount } from '../auth/passport';
import { access } from 'fs-extra';

const respond = <T>(promise: Promise<T>, res: express.Response, result: (data: T) => any = data => data) => {
    promise.then(data => res.send(result(data))).catch(err => res.json({ error: 'Error fetching data: ' + err }));
}

router.post('/register', isAuth, (req, res) => {
    req.body = req.fields;
    const teamRepo = DB.repo(Team);
    teamRepo.findOne({name: req.body.teamname}).then((team : Team) => {
        if(team) return res.json({error: "Teamname already in use"});
        let creator: Account = getAccount(req);
        const newTeam = new Team(req.body.teamname, creator );
        teamRepo.save(newTeam).then((teamDB: Team) => {
            DB.repo(Account).update(creator.id, {team: teamDB}).then(() => {
                return res.json({});
            }).catch((err)=> {return res.json({error: 'Cannot add account to team'});})
        }).catch((err) => { return res.json({error: 'Cannot create team'})});
    }).catch((err) => { return res.json({ error: 'Cannot retrieve data from DB' });});
});

router.post('/join/:uuid', isAuth, (req, res)=>{

});

router.get('/infoDashboard', isAuth, hasTeam, (req, res) => { 
    var acc: Account = getAccount(req);   
    res.redirect('/api/team/infoDashboard/' + acc.team.id);
})

//TODO: get placement, deduct solve.usedHints for each solve from points
/*router.get('/infoDashboard/:uuid', (req, res) => {
    let isCaptain: boolean = false;
    let uuid: string = req.params.uuid;
    let data = {name: '', placement: 0, points: 0, uuid: uuid};

    Promise.all([
        DB.repo(Team).findOne({where: {id: uuid}, relations: ['captain']}),
        DB.repo(Solve).find({where: {team: uuid}, relations: ['challenge']}),
    ]).then(([team, solves])=> {
        if(req.user) {
            let acc: Account = getAccount(req);
            if(team.captain.id == acc.id || acc.admin) isCaptain = true;
        }
        data.name = team.name;
        solves.forEach((solve: Solve)=>{
            data.points += solve.challenge.points;
        });
        res.json({info: data, isCaptain: isCaptain});
    }).catch((err)=> console.log(err));
    //get name, points and captain
    /*DB.repo(Team).findOne({where: {id: req.params.uuid}, join: {
        alias: 'team',
        leftJoinAndSelect: {
            captain: 'team.captain'
        }
    }}).then((team: Team)=>{
        console.log(team);
        if(req.user) {
            let acc: Account = getAccount(req);
            if(team.captain.id == acc.id || acc.admin) isCaptain = true;
        }
        data.name = team.name;
        team.solves.forEach((solve: Solve)=> {
            data.points += solve.challenge.points;
            solve.usedHints.forEach((usedHint: UsedHint)=> {
                data.points -= usedHint.hint.cost;
            });
        });
        //TODO: get placement
        let result = {info: data, isCaptain: isCaptain};
        console.log(result);
        return res.json({niks: 'i'});
    }).catch((err)=>{console.log(err); return res.json({error: err})});*/
//});

//TODO: get placement
router.get('/infoDashboard/:uuid', (req, res) => {
    let isCaptain: boolean = false;
    let uuid: string = req.params.uuid;
    let data = {name: '', placement: 0, points: 0, uuid: uuid};

    DB.repo(Team).findOne({where: {id: uuid}, relations:['captain', 'solves', 'solves.challenge', 'solves.usedHints', 'solves.usedHints.hint']}).then((team: Team)=>{
        console.log(team);
        if(req.user) {
            let acc: Account = getAccount(req);
            if(team.captain.id == acc.id || acc.admin) isCaptain = true;
        }
        data.name = team.name;
        team.solves.forEach((solve: Solve)=>{
            data.points += solve.challenge.points;
            solve.usedHints.forEach((usedHint: UsedHint)=>{
                data.points -= usedHint.hint.cost
            })
        });
        res.json({info: data, isCaptain: isCaptain});
    }).catch((err)=>{res.json({error: 'Error retrieving data'});});
});

router.get('/getMembers/:uuid', (req, res) => {
    let data: {name: string, points: number}[] = [];
    let uuid: string = req.params.uuid;
    DB.repo(Account).find({where: {team: uuid}, relations: ['solves', 'solves.challenge']}).then((members: Account[]) => 
        {
            members.forEach((member: Account) => {
                let points: number = 0;
                member.solves.forEach((solve: Solve)=> {
                    points += solve.challenge.points;
                });
                data.push({name: member.name, points: points});
            });
            res.json(data);            
        }).catch((err)=>{console.log(err);res.json({error: 'Error retrieving members'})});
});

//TODO: testing
router.get('/getSolves/:uuid', (req, res) => {
    let data: {name: string, category: {name: string, description: string}, value: number, date: number}[] = [];
    let uuid: string = req.params.uuid;
    DB.repo(Solve).find({where: {team: uuid}, relations: ['challenge', 'challenge.tag']}).then((solves: Solve[]) => 
        {
            solves.forEach((solve: Solve) => {
                data.push({name: solve.challenge.name, category: {name: solve.challenge.tag.name, description: solve.challenge.tag.description}, value: solve.challenge.points, date: solve.timestamp});
            });
            res.json(data);            
        }).catch((err)=>{res.json({error: 'Error retrieving solves'})});
});

export default { path: '/team', router };