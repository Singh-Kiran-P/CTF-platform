import Router from 'express';
const router = Router();
import DB, { Team, Account, Category } from '../database';
import { isAuth, isAdmin } from '../auth/passport';

router.get('/hasTeam', isAuth, (req: any, res) => {
    DB.repo(Account).findOne({
        where: {id: req.user.id},
        relations: ['team']})
        .then((acc: Account) => {
        console.log(acc);
        if(acc.team) {
            return res.send(true);
        }
        return res.send(false);
    })
})

export default { path: '/account', router };