import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import formidable from 'express-formidable';
import path from 'path';
import { strategy } from './auth';
import routes from './routes';
import DB from './database';
const expressip = require('express-ip');
dotenv.config();

// setup express
const app = express();
app.use(formidable());

// setup to get Ip address
app.use(expressip().getIpInfoMiddleware);

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
    else DB.once('connect', () => next());
});

// serve docs
app.use('/docs', express.static(path.join(__dirname, "../../../", 'docs')));

//to fetch images
app.use('/sponsors', express.static(path.join(__dirname, "../../../" , 'uploads', 'sponsors')));

// register all routes
routes.forEach(route => app.use(route.path, route.router));

// CORS middleware
app.use(cors())

// start the server
const server = app.listen(process.env.SERVER_PORT);

// Socket IO
import io from './controllers/socket';
io.init(server);
