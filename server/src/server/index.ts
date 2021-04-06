import dotenv from 'dotenv';
import express from 'express';
import { Category } from '../database/entities/users/Category';
import Database from '../database';
dotenv.config();

// TODO: create and set other main file in package.json

const app = express();
const port = process.env.SERVER_PORT;

app.get('/', (req, res) => {
    res.send('yo lo');
});

app.get('/getId', (req, res) => {
    // render the index template
    res.json({ username: 'Flavio' });
});

// start the express server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

// example database usage
Database.on('connect', connection => {
    console.log('Database connected');

    connection.query('SELECT * FROM category').then((categories: Category[]) => {
        console.log('available categories: ');
        console.log(JSON.stringify(categories));
    }).catch(error => console.log(error));
});

export default app;
