import Router from 'express';
const router = Router();
import passport from 'passport';
import { generatePassword } from '../auth/passportUtils';
import DB, { Account, Category } from '../database';
import Roles from '../auth/Roles';
import Errors from '../auth/Errors';
import { isAuth, isAdmin } from '../auth/authMiddleware';
import { RESERVED_EVENTS } from 'socket.io/dist/socket';

//POST ROUTES
router.post('/login', (req, res, next) => {
    console.log('login route entered');
    passport.authenticate('local', (err, user, info) => {
        console.log('callback');
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
                });
        })
    });
});

router.get('/logout', (req, res, next) => {
    req.logOut(); // removes the req.user property and clears the login session
    console.log('logged out');
    //res.redirect('/login');
})

//test
router.get('/account/:name', (req, res) => {
    const accountRepo = DB.repo(Account);

    accountRepo.findOne({name: req.params.name})
    .then((acc:Account)=> {
        if(acc) {
            return res.json({error: 'exists'});
        }
        return res.json({error: true, type: "USERNAME" })
    });
    /*
    if(accountRepo.findOne({name: req.body.username})) {
        res.send(acc)
    }*/
});

router.get('/test', isAuth, isAdmin, (req, res) => {
    console.log('passed all auth tests');
})

router.get('/loadCategories', (_, res) => {
    DB.repo(Category).find({ order: { priority: 'ASC' } })
    .then((data: Category[] )=> {
        res.json({
            categories: data.map(category => category.name),
        });
    });
});

export default { path: '/auth', router };