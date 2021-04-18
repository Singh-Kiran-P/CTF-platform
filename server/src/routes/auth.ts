import Router from 'express';
const router = Router();
import passport from 'passport';
import { generatePassword } from '../auth/passportUtils';
import DB, { Account, Category } from '../database';
import Roles from '../auth/Roles';
import Errors from '../auth/Errors';
import { isAuth, isAdmin } from '../auth/authMiddleware';

//POST ROUTES
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        //server error, not a passport/authentication error, send error to frontend
        if (err) {
            return res.json({error: 'Server/Database error, contact support'});
        }
        //login failed, invalid username or password, send error to frontend
        if (!user) {
            return res.json({error: info.message}); //status 401 needed?
        }
        //login succeeded
        //save user in express-session
        req.login(user, err => {
            if (err) 
                next(err);
        });
        console.log(req.user);
        return res.sendStatus(200);
    })(req,res,next);
});

router.post('/register', (req, res, next) => {
    const accountRepo = DB.repo(Account);
 
    accountRepo.findOne({name: req.body.username}).then((acc : Account) => {
        if(acc) {
            return res.json({error: Errors.USER_ALREADY_EXISTS});
        }
        const hashedPasswordData = generatePassword(req.body.password);

        const salt : string = hashedPasswordData.salt;
        const hashedPass : string = hashedPasswordData.hash;

        DB.repo(Category).findOne({name: req.body.category}).then((category: Category) => {
            const newAccount = new Account(req.body.username, hashedPass, salt, Roles.participant, category);

            accountRepo.save(newAccount)
                .then((account: Account) => {
                    console.log(account);
                    return res.sendStatus(200);
                });
        })
    }).catch((error) => {
        console.log(error);
    });
    ;
});

router.get('/logout', (req, res, next) => {
    req.logOut(); // removes the req.user property and clears the login session
    console.log('logged out');
    res.sendStatus(200);
})

router.get('/test', isAuth, isAdmin, (req, res) => {
    console.log('passed all auth tests');
    return res.sendStatus(200);
})

router.get('/getAuthRole', (req: any, res) => {
    if(req.isUnauthenticated()) {
        return res.json({role: Roles.visitor});
    } else {
        return res.json({role: req.user.role})
    }
});

router.get('/loadCategories', (_, res) => {
    DB.repo(Category).find({ order: { priority: 'ASC' } })
    .then((data: Category[] )=> {
        res.json({
            categories: data.map(category => category.name),
        });
    });
});

export default { path: '/auth', router };