import path from 'path';
import 'reflect-metadata';
import dotenv from 'dotenv';
import EventEmitter = require('events');
import { Connection, createConnection, EntityTarget, ObjectType, Repository } from 'typeorm';
import loadTestData from './testData';
dotenv.config();

// TODO: create entity CRUD operations (custom entity repositories)

interface DatabaseEvents {
    // defines all events the database can emit
    connect: () => void;
    error: (error: any) => void;
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
            type: "postgres",
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            synchronize: true,
            logging: false,
            entities: [
                path.join(__dirname, '/entities/*/*.js')
            ]
        }).then(async conn => {
            this.conn = conn;
            await this.conn.query(`SET search_path TO ${process.env.DB_SCHEMA};`);
            if (this.loadTestData) await loadTestData();
            console.log('Connected');

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
    connection(){
        if (this.conn) {
            return this.conn;
        }
    }

    /**
     * allows for efficiently updating the database to a new list of entities, if you want to use this function ask Lander how to use it
     */
    setRepo<E>(repo: Repository<E>, newEntries: E[], id: (x: E) => any[], files: (x: E) => string[] = () => []) {
        const equal = (x: any[], y: any[]): boolean => x.length == y.length && x.every((_, i) => x[i] == y[i]);
        return new Promise<void>((resolve, reject) => {
            repo.find().then(old => {
                let [save, remove]: E[][] = [newEntries.filter(entry => !old.some(x => equal(id(entry), id(x)))), []];
                old.forEach(entry => {
                    let match = newEntries.find(x => equal(id(entry), id(x)));
                    match == undefined ? remove.push(entry) : save.push(Object.assign(entry, match));
                });
                let oldFiles = old.reduce((acc, c) => acc.concat(files(c)), ['']).filter(f => f && !newEntries.some(x => files(x).includes(f))); // TODO: remove these files
                Promise.all([
                    repo.save(save),
                    repo.remove(remove)
                ]).then(() => resolve()).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }


}

declare interface Database {
    // applies DatabaseEvents to Database to enable event checking
    on<U extends keyof DatabaseEvents>(
        event: U,
        listener: DatabaseEvents[U]
    ): this;

    once<U extends keyof DatabaseEvents>(
        event: U,
        listener: DatabaseEvents[U]
    ): this;

    emit<U extends keyof DatabaseEvents>(
        event: U,
        ...args: Parameters<DatabaseEvents[U]>
    ): boolean;
}

const instance: Database = new Database();
export default instance;

export { Account } from './entities/accounts/Account';
export { Category } from './entities/accounts/Category';
export { Team } from './entities/accounts/Team';
export { Attachment } from './entities/challenges/Attachment';
export { Challenge, ChallengeType } from './entities/challenges/Challenge';
export { Hint } from './entities/challenges/Hint';
export { Question } from './entities/challenges/Question';
export { Round } from './entities/challenges/Round';
export { Tag } from './entities/challenges/Tag';
export { Competition, CompetitionRepo } from './entities/competition/Competition';
export { Page } from './entities/competition/Page';
export { Sponsor } from './entities/competition/Sponsor';
export { Attempt, AttemptType } from './entities/connections/Attempt';
export { Environment } from './entities/connections/Environment';
export { Solve } from './entities/connections/Solve';
export { UsedHint } from './entities/connections/UsedHint';

export {DockerChallengeContainer} from './entities/docker/DockerChallengeContainer';
export {DockerChallengeImage} from './entities/docker/DockerChallengeImage';
export {DockerManagement, DockerManagementRepo} from './entities/docker/DockerManagement';
export {DockerOpenPort} from './entities/docker/DockerOpenPort'
