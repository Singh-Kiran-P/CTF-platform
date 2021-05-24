import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import formidable from 'express-formidable';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

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

// register all routes
routes.forEach(route => app.use(route.path, route.router));

// CORS middleware
app.use(cors())

// app.use((req, res, next) => {
//     // res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-HEaders', 'Content-Type, Authorization');
//     next();
// });

// start the server
const server = app.listen(process.env.SERVER_PORT);

// Socket IO
import io from './controllers/socket';
let socket = io.init(server);
socket.on('connection', (_socket: any) => {
    console.log('Client connected to socket!');
})
