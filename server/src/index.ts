import App from './server';
import DB from './database';
import { Team } from './database/entities/participants/Team';

// example server usage
App.get('/', (req, res) => {
    res.send('yo lo 2');
});

App.get('/getId', (req, res) => {
    res.json({ username: 'Flavio :)' });
});

// example database usage
DB.on('connect', conn => {
    console.log('Database connected');
    conn.getRepository(Team).find({ relations: ['participants'] }).then(entries => {
        console.log('Availale teams:');
        console.log(JSON.stringify(entries));
    });
});
