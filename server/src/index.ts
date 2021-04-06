import App from './server';
import DB from './database';

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

    const log = (entity: string) => { // very simple log to inspect entries of an entity
        conn.query(`SELECT * FROM ${entity}`).then(entries => {
            console.log(`available ${entity}s:`);
            console.log(JSON.stringify(entries));
        });
    }

    log('category');
    log('participant');
    log('team');
});
