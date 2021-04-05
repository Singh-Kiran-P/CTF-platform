import 'reflect-metadata';
import EventEmitter = require('events');
import { Connection, createConnection } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();

/*
TODO: test entities and create entity CRUD operations
*/

interface DatabaseEvents { // defines all events the database can emit
    'connect': (connection: Connection) => void;
    'error': (error: any) => void;
}

/**
 * Database class to connect to the database and provide help functions to access it
 */
class Database extends EventEmitter {
    connection: Connection = null;

    constructor() {
        super();
        this.connect();
    }

    connect(): void {
        createConnection({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            synchronize: true,
            logging: true,
            entities: [
                __dirname + '/entities/*/*.js'
            ]
        }).then(async connection => {
            this.connection = connection;
            this.emit('connect', this.connection);
        }).catch(error => this.emit('error', error));
    }

    connected(): boolean {
        return this.connection !== null;
    }
}

declare interface Database { // applies DatabaseEvents to Database to enable event checking
    on<U extends keyof DatabaseEvents>(
        event: U, listener: DatabaseEvents[U]
    ): this;

    emit<U extends keyof DatabaseEvents>(
        event: U, ...args: Parameters<DatabaseEvents[U]>
    ): boolean;
}

const instance: Database = new Database();
export default instance;
