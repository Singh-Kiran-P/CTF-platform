import express from 'express';
import passport from 'passport';
import Roles from '@shared/roles';
import DB, { Account, Category } from '../database';
import { validForm, Form } from '@shared/validation/registerForm'; 
import { getAccount } from '../auth/passport';
const router = express.Router();

router.post('/login', (req, res, next) => {
    const error = (err?: string) => res.json({ error: err || 'Could not login user' });
    req.body = req.fields;
    passport.authenticate('local', (err, user) => {
        if (err) return error(err);
        if (!user) return error();
        req.login(user, err => {
            if (err) return error();
            res.json({});
        });
    })(req, res, next);
});

router.post('/register', (req, res) => {
    let data = req.fields as Form;
    const error = (err?: string) => res.json({ error: err || 'Could not register user' });
    if (!validForm(data)) return error();
    Promise.all([
        DB.repo(Account).findOne({ name: data.username }),
        DB.repo(Category).findOne({ name: data.category })
    ]).then(([account, category]) => {
        if (!category) return error('Category does not exist');
        if (account) return error('Username already exists');
        DB.repo(Account).save(new Account(data.username, data.password, category)).then(account => {
            if (!account) error();
            req.login(account, err => {
                if (err) return error('Could not login user');
                res.json({});
            });
        }).catch(() => error());
    }).catch(() => error());
});

router.get('/logout', (req, res) => {
    req.logout();
    res.json({});
})

router.get('/role', (req, res) => {
    if (req.isUnauthenticated()) res.send(Roles.VISITOR);
    else res.send(getAccount(req).admin ? Roles.ORGANIZER : Roles.PARTICIPANT);
});

export default { path: '/auth', router };
