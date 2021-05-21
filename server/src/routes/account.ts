import express from 'express';
const router = express.Router();
import DB, { Team, Account, Category, Solve } from '../database';
import { isAuth, isAdmin, getAccount } from '../auth/index';
import { send } from 'node:process';
import { ILike } from 'typeorm';

router.get('/hasTeam', isAuth, (req, res) => {
    let acc: Account = getAccount(req);
    DB.repo(Account).findOne({
        where: {id: acc.id},
        relations: ['team']})
        .then((acc: Account) => {
        if(acc.team) {
            return res.send(true);
        }
        return res.send(false);
    })
});

router.get('/getUsers', (req, res) => {
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

    DB.repo(Account).find(
        {
            where: { name: ILike('%' + filter + '%'), admin: false }, order: { name: nameOrder },
            relations: ['solves', 'solves.challenge', 'solves.usedHints', 'solves.usedHints.hint'],
        }
    ).then((accountsDB: Account[]) => {
        let accountsData: { id: number, name: string, category: string, points: number, team: string, teamUuid: string }[] = [];
        accountsDB.forEach((account: Account) => {
            var accountData: { id: number, name: string, category: string, points: number, team: string, teamUuid: string } = { id: 0, name: '', category: '', points: 0, team: '', teamUuid: '' };
            accountData.id = account.id;
            accountData.name = account.name;
            accountData.category = account.category.name;
            accountData.points = account.getPoints();
            if(account.team) {
                accountData.team = account.team.name;
                accountData.teamUuid = account.team.id;
            } else {
                accountData.team = 'None';
            }            
            if(filterCategory == '') accountsData.push(accountData);
            else if (filterCategory == account.category.name) accountsData.push(accountData);
        });
        let amount = accountsData.length;
        if(params.sortBy == 'points') {
            if(params.sortDirection == 'ASC') accountsData.sort((t1, t2)=>t2.points-t1.points);
            else accountsData.sort((t1, t2)=>t1.points-t2.points);
        }
        return res.json({ users: accountsData.slice(skip, skip+perPage), amount: amount });
    }).catch((err) => { return res.json({ error: err }) });
});

//TODO: do solves need to be removed? from team? or user?
router.post('/leaveTeam', isAuth, (req, res) => {
    let acc: Account = getAccount(req);
    DB.repo(Account).update(acc.id, {team: null}).then((response)=>{res.json({})}).catch((err)=>{res.json({error: 'DB error, cannot leave team'})});
})

export default { path: '/account', router };
