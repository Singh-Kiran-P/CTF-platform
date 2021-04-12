import passport from 'passport';
import passportLocal from 'passport-local';
const LocalStrategy = passportLocal.Strategy;
//import passportJWT from 'passport-jwt';
//const JWTStrategy = passportJWT.Strategy;
//const ExtractJWT = passportJWT.ExtractJwt;
import DB from '../database';
import { Account } from '../database/entities/accounts/Account';
import { validPassword } from './passportUtils';
import Errors from './Errors';

const AccountRepo = DB.repo(Account);

//if fieldnames in frontend are different from 'username' and 'password' these have to be set
const htmlFieldNames = {
    usernameField: 'username',
    passwordField: 'password'
}

const strategy = new LocalStrategy(htmlFieldNames, 
    (username: string, password: string,  done ) => {
        AccountRepo.findOne({name: username})
            .then((account: Account) => {
                //No account with this username found
                if (!account) {return done(Errors.USER_NOT_FOUND, false)}

                if(validPassword(password, account.password, account.salt)) {
                    return done(null, account);
                } else {
                    return done(Errors.WRONG_PASSWORD, false);
                }
            })
            .catch((err) => {
                done(err);
            });
    }
);

passport.use(strategy);

//session serialization and unserialization
passport.serializeUser((account: Account, done) => {
    done(null, account.id);
});

passport.deserializeUser((accountId: number, done) => {
    AccountRepo.findOne(accountId)
        .then((account: Account) => {
            done(null, account);
        })
        .catch(err => done(err))
});
