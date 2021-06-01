import cors from 'cors';
import express from 'express';
import passport from 'passport';
import session from 'express-session';
import formidable from 'express-formidable';
import { Root, uploaddir, docsdir } from './files';
const expressip = require('express-ip');
import { strategy } from './auth';
import routes from './routes';
import DB from './database';
import dotenv from 'dotenv';
dotenv.config();

// setup express
const app = express();
app.use(formidable());

// setup to get Ip address
app.use(expressip().getIpInfoMiddleware);

let sess: session.SessionOptions = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 31 }
};

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

// static serving files
app.use('/docs', express.static(Root + docsdir + '/docs'));
app.use('/docs-routes', express.static(Root + docsdir + '/routes-docs'));
app.use('/sponsors', express.static(Root + uploaddir + '/sponsors'));
app.use('/pages', express.static(Root + uploaddir + '/pages'));

// register all routes
routes.forEach(route => app.use(route.path, route.router));

// CORS middleware
app.use(cors());

// start the server
const server = app.listen(process.env.SERVER_PORT);

// Socket IO
import io from './controllers/socket';
io.init(server);
