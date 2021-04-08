import passport from 'passport';
import passportJWT from 'passport-jwt';
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
import { Account } from '../database/entities/accounts/Account';

