import dotenv from 'dotenv';
import DB from './database';
import express from 'express';
import routes from './routes';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// listener called before every single route, calls any following routes once the database is connected
// this ensures that the database is already connected in every single route listener
// app.all(/./, (_, __, next) => {
//     if (DB.connected()) next();
//     else DB.on('connect', () => next());
// });
routes.forEach(route => app.use(route.path, route.router));

app.listen(process.env.SERVER_PORT);
