import 'reflect-metadata';
import dotenv from 'dotenv';
import EventEmitter = require('events');
import { Connection, createConnection, EntityTarget, ObjectType, Repository } from 'typeorm';
import loadTestData from './testData';
dotenv.config();

// TODO: create entity CRUD operations (custom entity repositories)

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
            await this.conn.query(`SET search_path TO ${process.env.DB_SCHEMA};`);
            if (this.loadTestData) await loadTestData();
            this.emit('connect');
        }).catch(error => this.emit('error', error));
    }

    connected(): boolean {
        return this.conn != null;
    }

    /**
     * returns the repository for the given entity, assumes the database is connected
     */
    repo<E>(entity: EntityTarget<E>): Repository<E> {
        if (this.conn) {
            return this.conn.getRepository(entity);
        }
    }

    /**
     * returns an instance of the given custom repository, assumes the database is connected
     */
    crepo<E>(entity: ObjectType<E>): E {
        if (this.conn) {
            return this.conn.getCustomRepository(entity);
        }
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

export { Account } from './entities/accounts/Account';
export { Category } from './entities/accounts/Category';
export { Team } from './entities/accounts/Team';
export { Attachment } from './entities/challenges/Attachment';
export { Challenge } from './entities/challenges/Challenge';
export { Hint } from './entities/challenges/Hint';
export { Question } from './entities/challenges/Question';
export { Round } from './entities/challenges/Round';
export { Tag } from './entities/challenges/Tag';
export { Competition, CompetitionRepo } from './entities/competition/Competition';
export { Page } from './entities/competition/Page';
export { Sponsor } from './entities/competition/Sponsor';
export { Attempt } from './entities/connections/Attempt';
export { Environment } from './entities/connections/Environment';
export { Solve } from './entities/connections/Solve';
export { UsedHint } from './entities/connections/UsedHint';
