import { Account } from '../database/entities/accounts/Account';

function isAuth(req, res, next) {
    if(req.isAuthenticated()) {
        console.log('authenticated');
        next();
    } else {
        console.log('not logged in');
        res.status(401).json({message: 'You are not authorized to view this page'});
    }
}

function isAdmin(req, res, next) {
    if(req.isAuthenticated() && req.user.isAdmin()) { //user object is set by passportjs
        console.log('you are admin');
        next();
    } else {
        console.log('you are not admin');
        res.status(401).json({message: 'You are not an admin, you can\'t view this page'});
    }
}

export {isAuth, isAdmin};