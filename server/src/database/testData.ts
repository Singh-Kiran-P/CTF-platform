import Database from '../database';
import { Category } from './entities/users/Category';

/**
 * loads test entries into the database
 * this function is called each time the database connection is made, after emptying the database
 */
async function loadTestData() {
    // TODO: load proper test data, requires creating entity constructors

    let category = new Category();
    category.name = 'test 1';
    category.priority = 1;
    await Database.connection.manager.save(category);
}

/**
 * truncates all tables in the database
 */
async function emptyDatabase() {
    for (const entity of Database.connection.entityMetadatas) { // for every table
        if (entity.tableName == 'user') continue;
        await Database.connection.query(`DELETE FROM ${entity.tableName};`); // truncate the table
    }
}

export default async () => {
    await emptyDatabase();
    await loadTestData();
};
