import dotenv from "dotenv";
import express from "express";
import session from 'express-session';
import passport from 'passport';
import { Session } from './database/entities/sessions/Session';
import { TypeormStore } from 'connect-typeorm';
import formidableMiddleware from 'express-formidable';
import DB from "./database";
import routes from './routes';
dotenv.config();

//create express
const app = express();
app.use(formidableMiddleware());

// SESSION SETUP
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET
    /*cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000
    }*/
  }
));

//PASSPORT AUTHENTICATION
require('./auth/passport'); //make sure app uses local login strategy
app.use(passport.initialize());
app.use(passport.session());

// routes
// listener called before every single route, calls any following routes once the database is connected
// this ensures that the database is already connected in every single route listener
app.all(/./, (_, __, next) => {
    if (DB.connected()) next();
    else DB.on('connect', () => next());
});

routes.forEach(route => app.use(route.path, route.router));

app.listen(process.env.SERVER_PORT);
