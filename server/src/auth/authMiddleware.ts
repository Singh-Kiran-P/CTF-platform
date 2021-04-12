import { Account } from '../database/entities/accounts/Account';

function isAuth(req, res, next) {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({message: 'You are not authorized to view this page'});
    }
}

function isAdmin(req, res, next) {
    if(req.isAuthenticated() && req.account.isAdmin()) {
        next();
    } else {
        res.status(401).json({message: 'You are not an admin, you can\'t view this page'});
    }
}

export {isAuth, isAdmin};