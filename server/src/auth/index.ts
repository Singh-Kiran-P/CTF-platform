import crypto from 'crypto';
import express from 'express';
import passport from 'passport';
import DB, { Account } from '../database';
import { Strategy as LocalStrategy } from 'passport-local';

// passport setup

// the html fieldnames used in the frontend
const htmlFieldNames = {
    usernameField: 'username',
    passwordField: 'password'
}

const strategy = new LocalStrategy(htmlFieldNames, (username: string, password: string, done) => {
    DB.repo(Account).findOne({ where: { name: username } }).then(account => {
        if (!account) done({ username: 'User does not exist' });
        else if (validatePassword(password, account.password, account.salt)) done(null, account);
        else done({ password: 'Invalid password' });
    }).catch(() => done('Error retrieving users'));
});

passport.serializeUser((account: Account, done) => {
    done(null, account.id);
});

passport.deserializeUser((accountId: number, done) => {
    DB.repo(Account).findOne(accountId).then(account => {
        done(null, account);
    }).catch(() => done('Error retrieving users'));
});



// auth functions

const getAccount = (req: express.Request): Account => req.user as Account;

const isAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) next();
    else res.json({ error: 'Unauthorized request' });
}

const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if(req.isAuthenticated() && getAccount(req).admin) next();
    else res.json({ error: 'Unauthorized request' });
}

const hasTeam = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let acc: Account = getAccount(req);
    if (acc.team != null) next();
    else res.json({ error: 'You are not part of a team' });
}



// hash functions

// see https://tools.ietf.org/html/rfc8018
const hash = (password: string, salt: string) => crypto.pbkdf2Sync(password, salt, 12345, 64, 'sha512').toString('hex');

const generatePassword = (password: string) => {
    let salt = crypto.randomBytes(32).toString('hex');
    let hashed = hash(password, salt);
    return { salt: salt, hash: hashed };
}

const validatePassword = (password: string, hashed: string, salt: string) => {
    return hashed == hash(password, salt);
}

export { strategy, isAuth, isAdmin, hasTeam, getAccount, generatePassword };
