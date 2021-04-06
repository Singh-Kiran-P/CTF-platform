import dotenv from 'dotenv';
import express from 'express';
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
Database.on('connect', conn => {
    console.log('Database connected');

    conn.query('SELECT * FROM category').then((categories) => {
        console.log('available categories:');
        console.log(JSON.stringify(categories));
    });
});

export default app;
