import DB from '../database';
import { Category } from './entities/participants/Category';

/**
 * loads test entries into the database
 * this function is called each time the database connection is made, after emptying the database
 */
async function loadTestData() {
    // TODO: load proper test data, requires creating entity constructors

    let category = new Category();
    category.name = 'test 1';
    category.priority = 1;
    await DB.conn.manager.save(category);
}

/**
 * truncates all tables in the database
 */
async function emptyDatabase() {
    for (const entity of DB.conn.entityMetadatas) { // for every table
        await DB.conn.query(`DELETE FROM ${entity.tableName};`); // truncate the table
    }
}

export default async () => {
    await emptyDatabase();
    await loadTestData();
};
