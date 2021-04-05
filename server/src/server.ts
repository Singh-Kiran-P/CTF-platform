import dotenv from 'dotenv';
import express from 'express';
import Database from './database';
dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

// define a route handler for the default home page
app.get('/', (req, res) => {
    // render the index template
    res.send('yo lo');
});

app.get('/getId', (req, res) => {
    // render the index template
    res.json({ username: 'Flavio' });
});

// start the express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

// example database usage
Database.on('connect', connection => {
    console.log('Database connected');
});
