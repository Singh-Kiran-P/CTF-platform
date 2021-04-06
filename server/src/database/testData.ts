import DB from '../database';
import { Team } from './entities/participants/Team';
import { Category } from './entities/participants/Category';
import { Participant } from './entities/participants/Participant';

/**
 * loads test entries into the database
 * this function is called each time the database connection is made, after emptying the database
 */
async function loadTestData() {
    const save = async (entries: any[]): Promise<any[]> => {
        await DB.conn.manager.save(entries);
        return entries;
    }

    let categories: Category[] = await save([
        new Category('BACH 1', 1),
        new Category('BACH 2', 2),
        new Category('BACH 3', 3),
        new Category('MAST 1', 4),
        new Category('MAST 2', 5)
    ]);
    let participants: Participant[] = await save([
        new Participant('John', 'password', categories[0]),
        new Participant('Edward', 'password', categories[1]),
        new Participant('Thomas', 'password', categories[2]),
        new Participant('John 2', 'password', categories[3]),
        new Participant('BOB!', 'password', categories[4])
    ]);
    let teams: Team[] = await save([
        new Team('Team 1', participants[0]),
        new Team('Team 2', participants[2]),
        new Team('Team 3', participants[4])
    ]);
    participants[1].team = teams[0]; // TODO: update in database
    participants[3].team = teams[1]; // TODO: update in database
}

/**
 * truncates all tables in the database
 */
async function emptyDatabase() {
    for (const entity of DB.conn.entityMetadatas) { // for every table
        await DB.conn.query(`ALTER TABLE ${entity.tableName} DISABLE TRIGGER ALL;`); // disable triggers to bypass contraints
        await DB.conn.query(`DELETE FROM ${entity.tableName};`); // delete all entries
        await DB.conn.query(`ALTER TABLE ${entity.tableName} ENABLE TRIGGER ALL;`); // enable triggers again
    }
}

export default async () => {
    await emptyDatabase();
    await loadTestData();
};
