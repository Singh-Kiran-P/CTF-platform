import 'reflect-metadata';
import dotenv from 'dotenv';
import EventEmitter = require('events');
import { Connection, createConnection, Db, EntityTarget, FindManyOptions, Repository } from 'typeorm';
import loadTestData from './testData';
dotenv.config();

// TODO: test entities and create entity CRUD operations

interface DatabaseEvents { // defines all events the database can emit
    'connect': () => void;
    'error': (error: any) => void;
}

/**
 * Database class to connect to the database and provide help functions to access it
 */
class Database extends EventEmitter {
    loadTestData: boolean = true; // empties and loads test data into the database before connecting if true
    conn: Connection = null;

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
            schema: process.env.DB_SCHEMA,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            synchronize: true,
            logging: true,
            entities: [
                __dirname + '/entities/*/*.js'
            ]
        }).then(async conn => {
            this.conn = conn;
            if (this.loadTestData) await loadTestData();
            this.emit('connect');
        }).catch(error => this.emit('error', error));
    }

    connected(): boolean {
        return this.conn !== null;
    }

    /**
     * returns the repository for the given entity, assumes the database is connected
     */
    repo<E>(entity: EntityTarget<E>): Repository<E> {
        return this.conn.getRepository(entity);
    }
}

declare interface Database { // applies DatabaseEvents to Database to enable event checking
    on<U extends keyof DatabaseEvents>(
        event: U, listener: DatabaseEvents[U]
    ): this;

    once<U extends keyof DatabaseEvents>(
        event: U, listener: DatabaseEvents[U]
    ): this;

    emit<U extends keyof DatabaseEvents>(
        event: U, ...args: Parameters<DatabaseEvents[U]>
    ): boolean;
}

const instance: Database = new Database();
export default instance;
