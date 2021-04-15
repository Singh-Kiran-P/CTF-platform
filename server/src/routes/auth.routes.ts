import Router from 'express';
const router = Router();
import passport from 'passport';
import { Repository } from 'typeorm';
import { generatePassword } from '../auth/passportUtils';
import DB, { Account, Category } from '../database';
import Roles from '../database/entities/accounts/Roles';
import Errors from '../auth/Errors';
import { RESERVED_EVENTS } from 'socket.io/dist/socket';

//POST ROUTES

router.post('/login', passport.authenticate('local'));

router.post('/register', (req, res, next) => {
    const accountRepo = DB.repo(Account);
    console.log(req.body.username);
    console.log(req.body.password);
    console.log(req.body.category);
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
    req.logOut();
    res.redirect('/login');
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

router.get('/test/:password', (req, res) => {
    console.log(req.params.password);
    const hashedPasswordData = generatePassword(req.params.password);
    res.send(hashedPasswordData);
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
