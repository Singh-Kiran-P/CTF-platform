import express from 'express';
import passport from 'passport';
import Roles from '@shared/roles';
import DB, { Account, Category } from '../database';
import { getAccount } from '../auth/passport';
const router = express.Router();

router.post('/login', (req, res, next) => {
    req.body = req.fields;
    passport.authenticate('local', (err, user) => {
        if (err) return res.json({ error: err });
        if (!user) return res.json({ error: 'Error authenticating user' });
        req.login(user, err => {
            if (err) return res.json({ error: err });
            return res.json({});
        });
    })(req, res, next);
});

router.post('/register', (req, res, next) => {
    res.json({ error: 'TODO: implement register' });
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
