import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Session } from '../database/entities/sessions/Session';
import { TypeormStore } from 'typeorm-store';
import DB from '../database';
dotenv.config();

// TODO: add more functionality to server? custom Server class?

// Create express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// SESSION SETUP
//Moet session opgeslagen in db? wordt oorspronkelijk door middleware op server zelf opgeslagen maar dit is niet echt schaalbaar.
const repository = DB.repo(Session);
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: new TypeormStore({ repository }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 //1day
    }
}))

//PASSPORT AUTHENTICATION
require('./auth/passport'); //make sure app uses local login strategy
app.use(passport.initialize());
app.use(passport.session());

//ROUTES

//SERVER
app.listen(process.env.SERVER_PORT);
export default app;