import express from 'express';
const router = express.Router();
import DB, { Team, Account, Solve, UsedHint } from '../database';
import { isAuth, hasTeam, getAccount, generatePassword, isAdmin } from '../auth/index';
import { ILike, Like } from 'typeorm';

router.post('/register', isAuth, (req, res) => {
    req.body = req.fields;
    const teamRepo = DB.repo(Team);
    teamRepo.findOne({ name: req.body.teamname }).then((team: Team) => {
        if (team) return res.json({ error: "Teamname already in use" });
        let creator: Account = getAccount(req);
        const newTeam = new Team(req.body.teamname, creator);
        teamRepo.save(newTeam).then((teamDB: Team) => {
            DB.repo(Account).update(creator.id, { team: teamDB }).then(() => {
                return res.json({});
            }).catch((err) => { return res.json({ error: 'Cannot add account to team' }); })
        }).catch((err) => { return res.json({ error: 'Cannot create team' }) });
    }).catch((err) => { return res.json({ error: 'Cannot retrieve data from DB' }); });
});

router.post('/delete/:uuid', isAuth, (req, res) => {
    let uuid: string = req.params.uuid;
    let acc: Account = getAccount(req);
    const teamRepo = DB.repo(Team);
    teamRepo.findOne({ where: { id: uuid }, relations: ['captain'] }).then((team: Team) => {
        if (!team) return res.json({ error: 'Team not found' });
        if (!(team.captain.id == acc.id || acc.admin)) return res.json({ error: 'You are not authorized to delete the team' });
        teamRepo.delete(uuid).then(() => { return res.json({}) }).catch((err) => { res.json({ error: 'Error removing team' }) });
    }).catch((err) => { res.json({ error: 'Db error: ' + err }) });
});

router.post('/newInviteLink/:uuid', isAuth, (req, res) => {
    let uuid: string = req.params.uuid;
    let acc: Account = getAccount(req);
    const teamRepo = DB.repo(Team);
    teamRepo.findOne({ where: { id: uuid }, relations: ['captain'] }).then((team: Team) => {
        if (!team) return res.json({ error: 'Team not found' });
        if (!(team.captain.id == acc.id || acc.admin)) return res.json({ error: 'You are not authorized to delete the team' });
        let code = generatePassword(team.id).hash;
        teamRepo.update(team.id, { inviteCode: code }).then(() => { return res.json({ inviteCode: code }) }).catch((err) => { res.json({ error: 'Error generating new link' }) });
    }).catch((err) => { res.json({ error: 'Db error: ' + err }) });
});

router.post('/join/:invite', isAuth, (req, res) => {
    let invite: string = req.params.invite;
    let acc: Account = getAccount(req);
    if (acc.team) return res.json({ error: 'You are already in a team' });
    DB.repo(Team).findOne({ where: { inviteCode: invite }, relations: ['accounts'] }).then((team: Team) => {
        if (!team) return res.json({ error: 'Invalid invite link' });
        if (team.memberCount() >= 4) return res.json({ error: 'Team is full, please contact the captain' });
        DB.repo(Account).update(acc.id, { team: team }).then(() => { return res.json({}) }).catch((err) => { res.json({ error: 'Server error: ' + err }) });
    }).catch((err) => { res.json({ error: 'Db error: ' + err }) });
});

router.get('/infoDashboard', isAuth, hasTeam, (req, res) => {
    var acc: Account = getAccount(req);
    res.redirect('/api/team/infoDashboard/' + acc.team.id);
})

//TODO: get placement
router.get('/infoDashboard/:uuid', (req, res) => {
    let isCaptainOrAdmin = false;
    let isAdmin = false;
    let isCaptain = false;
    let isMember = false;
    let uuid: string = req.params.uuid;
    let data = { name: '', placement: 0, points: 0, uuid: uuid, inviteCode: '' };

    DB.repo(Team).findOne({ where: { id: uuid }, relations: ['captain', 'accounts', 'solves', 'solves.challenge', 'solves.usedHints', 'solves.usedHints.hint'] }).then((team: Team) => {
        if (!team) return res.json({ error: 'Team not found' });
        if (req.user) {
            let acc: Account = getAccount(req);
            if (team.captain.id == acc.id || acc.admin) { isCaptainOrAdmin = true; data.inviteCode = team.inviteCode; } //mag weg
            if (team.captain.id == acc.id) {isCaptain = true; data.inviteCode = team.inviteCode; }
            else if (acc.admin) {isAdmin = true; data.inviteCode = team.inviteCode; }
            else if (team.accounts.some(member => member.id == acc.id)) { isMember = true; }
        }
        data.name = team.name;
        data.points = team.getPoints();
        res.json({ info: data, isMember: isMember, isCaptain: isCaptain, isAdmin: isAdmin });
    }).catch((err) => { res.json({ error: 'Team not found' }); });
});

router.get('/getMembers/:uuid', (req, res) => {
    let data: { name: string, points: number, captain: boolean }[] = [];
    let uuid: string = req.params.uuid;

    Promise.all([
        DB.repo(Account).find({ where: { team: uuid }, relations: ['solves', 'solves.challenge'] }),
        DB.repo(Team).findOne({ where: { id: uuid }, relations: ['captain'] })
    ]).then(([members, team]: [Account[], Team]) => {
        members.forEach((member: Account) => {
            data.push({ name: member.name, points: member.getPoints(), captain: team.captain.id == member.id });
        });
        res.json(data);
    }).catch((err) => { res.json({ error: 'Error retrieving members' }) });
});


router.get('/getSolves/:uuid', (req, res) => {
    let data: { name: string, category: { name: string, description: string }, value: number, date: string }[] = [];
    let uuid: string = req.params.uuid;

    DB.repo(Solve).find({ where: { team: uuid }, relations: ['challenge', 'challenge.tag'] }).then((solves: Solve[]) => {
        solves.forEach((solve: Solve) => {
            data.push({ name: solve.challenge.name, category: { name: solve.challenge.tag.name, description: solve.challenge.tag.description }, value: solve.challenge.points, date: solve.time });
        });
        res.json(data);
    }).catch((err) => { res.json({ error: 'Error retrieving solves' }) });
});

router.post('/removeMember/:uuid/:memberName', isAuth, (req, res) => {
    let uuid: string = req.params.uuid;
    let memberName: string = req.params.memberName;
    let reqAcc: Account = getAccount(req);

    DB.repo(Team).findOne({ where: { id: uuid }, relations: ['captain', 'accounts'] }).then((team: Team) => {
        if (!(team.captain.id == reqAcc.id || reqAcc.admin)) return res.json({ error: 'You are not authorized to remove a member' });
        if (!(team.accounts.some(member => member.name == memberName))) return res.json({ error: 'User to remove is not part of the team' });
        DB.repo(Account).update({ name: memberName }, { team: null }).then(() => {
            return res.json({});
        }).catch((error) => { return res.json({ error: 'Cannot remove member' }) });
    }).catch((error) => { return res.json({ error: 'Cannot find team' }) });
});

/*router.get('/getTeams', isAuth, isAdmin, (req, res) => {
    let params: any = req.query;
    const perPage: number = Number.parseInt(params.perPage);
    const currentPage: number = Number.parseInt(params.currentPage);
    const filter: string = params.filter;
    const skip: number = (currentPage - 1) * perPage;
    console.log(perPage);
    console.log(currentPage);
    DB.repo(Team).findAndCount(
        {
            where: { name: ILike('%' + filter + '%') }, order: { name: "ASC" },
            relations: ['accounts', 'solves', 'solves.challenge', 'solves.usedHints', 'solves.usedHints.hint'],
            take: perPage,
            skip: skip
        }
    ).then((data: [Team[], number]) => {

        let teamsDB: Team[] = data[0];
        let amount: number = data[1];
        let teamsData: { uuid: string, name: string, category: string, points: number }[] = [];

        teamsDB.forEach((team: Team) => {
            let teamData: { uuid: string, name: string, category: string, points: number } = { uuid: '', name: '', category: '', points: 0 };
            teamData.uuid = team.id;
            teamData.name = team.name;
            teamData.category = team.getCategory().name;
            teamData.points = team.getPoints();
            teamsData.push(teamData);
        });
        return res.json({ teams: teamsData, amount: amount });
    }).catch((err) => { return res.json({ error: err }) });*/

router.get('/getTeams', (req, res) => {
    let params: any = req.query;
    const perPage: number = Number.parseInt(params.perPage);
    const currentPage: number = Number.parseInt(params.currentPage);
    const filter: string = params.filter;
    const filterCategory: string = params.category;
    const skip: number = (currentPage - 1) * perPage;

    let nameOrder: 'ASC' | 'DESC' = 'ASC';
    if(params.sortBy == 'name') {
        nameOrder = params.sortDirection;
    }

    DB.repo(Team).find(
        {
            where: { name: ILike('%' + filter + '%') }, order: { name: nameOrder },
            relations: ['accounts', 'solves', 'solves.challenge', 'solves.usedHints', 'solves.usedHints.hint'],
        }
    ).then((teamsDB: Team[]) => {

        let teamsData: { uuid: string, name: string, category: string, points: number }[] = [];
        teamsDB.forEach((team: Team) => {
            var teamData: { uuid: string, name: string, category: string, points: number } = { uuid: '', name: '', category: '', points: 0 };
            teamData.uuid = team.id;
            teamData.name = team.name;
            teamData.category = team.getCategory().name;
            teamData.points = team.getPoints();
            if(filterCategory == '') teamsData.push(teamData);
            else if (filterCategory == team.getCategory().name) teamsData.push(teamData);
        });
        let amount = teamsData.length;
        if(params.sortBy == 'points') {
            if(params.sortDirection == 'ASC') teamsData.sort((t1, t2)=>t2.points-t1.points);
            else teamsData.sort((t1, t2)=>t1.points-t2.points);
        }
        return res.json({ teams: teamsData.slice(skip, skip+perPage), amount: amount });
    }).catch((err) => { return res.json({ error: err }) });
});

    export default { path: '/team', router };