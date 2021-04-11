import Router from 'express';
const authRouter = Router();
import passport from 'passport';
import { Repository } from 'typeorm';
import { generatePassword } from '../auth/passportUtils';
import DB from '../database';
import { Account } from '../database/entities/accounts/Account';
import Roles from '../database/entities/accounts/Roles';

const accountRepo = DB.repo(Account);

//POST ROUTES

authRouter.post('/login', passport.authenticate('local'), (req, res, next) => {});

authRouter.post('/register', (req, res, next) => {
    const hashedPasswordData = generatePassword(req.body.password);

    const salt : string = hashedPasswordData.salt;
    const hashedPass : string = hashedPasswordData.hash;

    const newAccount = new Account(req.body.username, hashedPass, salt, Roles.participant, req.body.category);

    accountRepo.save(newAccount)
        .then((account: Account) => {
            console.log(account);
        });
    
    res.redirect('/login');
});

authRouter.get('/logout', (req, res, next) => {
    req.logOut();
    res.redirect('/login');
})

authRouter.get('/test', (req, res) => {
    res.send('hello tester');
    //return res.json({message: "Welcome to template route!"});
})

export default authRouter;
