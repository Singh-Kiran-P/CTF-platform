import { Account } from '../database/entities/accounts/Account';
import Roles from './Roles';
import express from 'express';

function isAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    if(req.isAuthenticated()) {
        console.log('authenticated');
        next();
    } else {
        console.log('not logged in');
        res.status(401).json({message: 'You are not authorized to view this page'});
    }
}

function isAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    if(req.isAuthenticated() && false /* TODO: does not work req.user.role == Roles.admin */) { //user object is set by express session
        console.log('you are admin');
        next();
    } else {
        console.log('you are not admin');
        res.status(401).json({message: 'You are not an admin, you can\'t view this page'});
    }
}

export {isAuth, isAdmin};
