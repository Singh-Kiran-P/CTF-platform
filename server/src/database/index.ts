import 'reflect-metadata';
import { createConnection } from 'typeorm';
import User from './entities/user';
import dotenv from 'dotenv';

dotenv.config();

createConnection({
    type: 'postgres',
    host: 'localhost',
    port: parseInt(process.env.SERVER_PORT),
    database: 'test',
    username: 'postgres',
    password: 'postgres',
    synchronize: true,
    logging: true,
    entities: [
        'src/database/entities/*.js'
    ],
    migrations: [
        'src/database/migrations/*.js'
    ]
}).then(async connection => {
    let user = new User('name', 'password', 0, 0);

    await connection.manager.save(user);
    console.log('User has been saved');

}).catch(error => console.log(error));
