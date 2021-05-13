import path from 'path';
import 'reflect-metadata';
import dotenv from 'dotenv';
import EventEmitter = require('events');
import { Connection, createConnection, EntityTarget, FindManyOptions, ObjectType, Repository } from 'typeorm';
import { chain, remove } from '../files';
import loadTestData from './testData';
import express from 'express';
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
                path.join(__dirname, '/entities/*/*.js')
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

    /**
     * allows for easily responding to an axios request with data fetched from the database
     */
    respond<E>(promise: Promise<E>, res: express.Response, result: (data: E) => any = data => data): void {
        promise.then(data => res.send(result(data))).catch(() => res.json({ error: 'Error fetching data' }));
    }

    /**
     * allows for easily updating the given repository to a new list of entities, ask Lander for proper usage
     */
    setRepo<E>(repo: Repository<E>, set: E[], where: FindManyOptions<E>, files: (x: E) => string[], returnRepo: true): Promise<E[]>;
    setRepo<E>(repo: Repository<E>, set: E[], where?: FindManyOptions<E>, files?: (x: E) => string[], returnRepo?: false): Promise<void>;
    setRepo<E>(repo: Repository<E>, set: E[], where: FindManyOptions<E> = {}, files: (x: E) => string[] = () => [], returnRepo: boolean = false) {
        const id = (x: any): number => x.id || -1;
        return new Promise<void | E[]>((resolve, reject) => {
            const done = () => returnRepo ? repo.find(where).then(items => resolve(items)).catch(err => reject(err)) : resolve();
            repo.find(where).then(old => {
                let [keep, discard]: E[][] = [[], []];
                [set, old].forEach(l => l.sort((a, b) => id(a) - id(b)));
                for (let i = 0, j = 0, il = set.length, jl = old.length; i < il || j < jl; ++i, ++j) {
                    while (i < il && (j >= jl || id(set[i]) < id(old[j]))) keep.push(set[i++]);
                    while (j < jl && (i >= il || id(old[j]) < id(set[i]))) discard.push(old[j++]);
                    if (i < il && j < jl && id(set[i]) == id(old[j])) keep.push(Object.assign({}, old[j], set[i]));
                }

                let lowerCompare = (x: string, y: string) => x.toLowerCase() == y.toLowerCase();
                let removes = discard.reduce((acc, c) => acc.concat(files(c)), ['']).filter(f => f && !set.some(x => files(x).find(y => lowerCompare(f, y)))).map(f => () => remove(f));
                chain(() => repo.remove(discard), () => repo.save(keep), () => Promise.all(removes.map(remove => remove()))).then(() => done()).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }
}

// applies DatabaseEvents to Database to enable event checking
declare interface Database {
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
