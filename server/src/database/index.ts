import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { User } from './entities/User';
import dotenv from 'dotenv';

dotenv.config();

createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'ctf_platform',
    username: 'root',
    password: 'admin',
    synchronize: true,
    logging: true,
    entities: [
        __dirname + '/entities/*.js'
    ]
}).then(async connection => {
    let user = new User('name', 'password', 0, 0, 'ds');

    await connection.manager
        .save(user);

}).catch(error => console.log(error));
