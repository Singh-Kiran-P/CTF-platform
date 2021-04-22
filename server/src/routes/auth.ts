import express from 'express';
import passport from 'passport';
import Roles from '@shared/roles';
import DB, { Account, Category } from '../database';
import { getAccount, generatePassword } from '../auth/passport';
const router = express.Router();

router.post('/login', (req, res, next) => {
    req.body = req.fields;
    passport.authenticate('local', (err, user) => {
        if (err) return res.json({ error: err });
        if (!user) return res.json({ error: 'Error authenticating user' });
        req.login(user, err => {
            if (err) return res.json({ error: err });
            return res.json({ message: 'Logged in successfully!' });
        });
    })(req, res, next);
});

router.post('/register', (req, res, next) => {
    req.body = req.fields;
    console.log(req.body);
    const accountRepo = DB.repo(Account);
    accountRepo.findOne({ name: req.body.username }).then((acc: Account) => {
        if (acc) return res.json({ error: "Username already in use" });
        DB.repo(Category).findOne({ name: req.body.category }).then((category: Category) => {
            const newAccount = new Account(req.body.username, req.body.password, category);
            accountRepo.save(newAccount).then((account: Account) => {
                req.login(account, err => { if (err) return res.json({ error: err }); });
                return res.json({});
            }).catch((err) => { return res.json({ error: err }) });
        }).catch((err) => { return res.json({ error: err }) });
    }).catch((err) => { return res.json({ error: err }); });
});

router.get('/logout', (req, res, next) => {
    req.logout();
    res.json({});
})

router.get('/role', (req, res) => {
    if (req.isUnauthenticated()) res.send(Roles.VISITOR);
    else res.send(getAccount(req).admin ? Roles.ORGANIZER : Roles.PARTICIPANT);
});

export default { path: '/auth', router };
