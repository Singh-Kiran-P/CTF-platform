import express from 'express';
const router = express.Router();
import DB, { Team, Account, Category, Solve } from '../database';
import { isAuth, isAdmin, getAccount } from '../auth/index';
import { send } from 'node:process';

router.get('/hasTeam', isAuth, (req, res) => {
    let acc: Account = getAccount(req);
    DB.repo(Account).findOne({
        where: {id: acc.id},
        relations: ['team']})
        .then((acc: Account) => {
        console.log(acc);
        if(acc.team) {
            return res.send(true);
        }
        return res.send(false);
    })
});

//TODO: do solves need to be removed? from team? or user?
router.post('/leaveTeam', isAuth, (req, res) => {
    let acc: Account = getAccount(req);
    DB.repo(Account).update(acc.id, {team: null}).then((response)=>{res.json({})}).catch((err)=>{res.json({error: 'DB error, cannot leave team'})});
})

export default { path: '/account', router };