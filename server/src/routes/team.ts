import Router from 'express';
const router = Router();
import DB, { Team, Account, Category } from '../database';
import { isAuth, isAdmin } from '../auth/authMiddleware';

router.post('/register', isAuth, (req: any, res, next) => {
    const teamRepo = DB.repo(Team);
 
    teamRepo.findOne({name: req.body.teamname}).then((team : Team) => {
        if(team) {
            return res.json({error: 'TEAM_ALREADY_EXISTS'});
        }

        DB.repo(Account).findOne({id: req.user.id}).then((account: Account) => {
            const newTeam = new Team(req.body.teamname, account);

            teamRepo.save(newTeam)
                .then((team: Team) => {
                    console.log(team);
                    return res.sendStatus(200);
                });
        });
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/loadCategories', (_, res) => {
    DB.repo(Category).find({ order: { priority: 'ASC' } })
    .then((data: Category[] )=> {
        res.json({
            categories: data.map(category => category.name),
        });
    });
});

export default { path: '/team', router };