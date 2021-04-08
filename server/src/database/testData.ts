import DB from '../database';
import { Team } from './entities/accounts/Team';
import { Category } from './entities/accounts/Category';
import { Account } from './entities/accounts/Account';
import Roles from './entities/accounts/Roles';
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

    let accounts: Account[] = await save([
        new Account('John', 'password', Roles.participant, categories[0]),
        new Account('Edward', 'password', Roles.participant, categories[1]),
        new Account('Thomas', 'password', Roles.participant, categories[2]),
        new Account('John 2', 'password', Roles.participant, categories[3]),
        new Account('BOB!', 'password', Roles.participant, categories[4])
    ]);
    
    let teams: Team[] = await save([
        new Team('Team 1'),
        new Team('Team 2'),
        new Team('Team 3')
    ]);

    for (let i = 0; i < accounts.length; ++i) { // give every account a team
        accounts[i].team = teams[Math.round(i * (teams.length - 1) / (accounts.length - 1))];
        await DB.repo(Account).update(accounts[i].id, accounts[i]);
    }
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
