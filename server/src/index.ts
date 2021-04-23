import dotenv from "dotenv";
import express from "express";
import passport from 'passport';
import session from 'express-session';
import formidable from 'express-formidable';
import { strategy } from './auth';
import routes from './routes';
import DB from "./database";
dotenv.config();

// setup express
const app = express();
app.use(formidable());

let sess = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET,
    cookie: { secure: false }
};

// set secure cookies for production, TODO: test and verify if this works, potentially remove this
if (process.env.NODE_ENV == 'production') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
}

// setup session and passport
app.use(session(sess));
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

// listener called before every single route, calls any following routes once the database is connected
// this ensures that the database is already connected in every single route listener
app.all(/./, (_, __, next) => {
    if (DB.connected()) next();
    else DB.on('connect', () => next());
});

// register all routes
routes.forEach(route => app.use(route.path, route.router));

// start the server
app.listen(process.env.SERVER_PORT);
