import dotenv from 'dotenv';
import express from 'express';
import routes from './routes';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
routes.forEach(route => app.use(route.path, route.router));
app.listen(process.env.SERVER_PORT);
