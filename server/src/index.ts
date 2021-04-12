import dotenv from "dotenv";
import express from "express";
import session from 'express-session';
import passport from 'passport';
import { Session } from './database/entities/sessions/Session';
import { TypeormStore } from 'typeorm-store';
import DB from "./database";
import { Team } from "./database/entities/accounts/Team";
dotenv.config();

//create express
const app = express();
app.use(express.urlencoded());
app.use(express.json());

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

// template routes
const temproutes = require("./routes/template");
// route with prefix
app.use("/template", temproutes);

app.listen(process.env.SERVER_PORT);
console.log(`Server started at http://localhost:${process.env.SERVER_PORT}`);

/* // example database usage
DB.once('connect', () => {
    console.log('Database connected');
    DB.repo(Team).find({ relations: ['accounts', 'accounts.category'] }).then(entries => {
        console.log('Availale teams:');
        console.log(JSON.stringify(entries));
    });
});

 */
