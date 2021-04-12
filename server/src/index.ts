import dotenv from "dotenv";
import express from "express";
import session from 'express-session';
import passport from 'passport';
import { Session } from './database/entities/sessions/Session';
import { TypeormStore } from 'typeorm-store';
import DB from "./database";
import { Team } from "./database/entities/accounts/Team";
import routes from './routes';
dotenv.config();

//create express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION SETUP
//Moet session opgeslagen in db? wordt oorspronkelijk door middleware op server zelf opgeslagen maar dit is niet echt schaalbaar.
const repository = DB.repo(Session);
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    //saveUninitialized: true,
    store: new TypeormStore({ repository }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 //1day
    }
}))

//PASSPORT AUTHENTICATION
require('./auth/passport'); //make sure app uses local login strategy
app.use(passport.initialize());
app.use(passport.session());

// routes
const routes = require("./routes");
app.use(routes);
// listener called before every single route, calls any following routes once the database is connected
// this ensures that the database is already connected in every single route listener
app.all(/./, (_, __, next) => {
    if (DB.connected()) next();
    else DB.on('connect', () => next());
});
routes.forEach(route => app.use(route.path, route.router));

app.listen(process.env.SERVER_PORT);
