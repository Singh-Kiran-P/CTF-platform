import DB, { Team, Competition, Category, Tag, Account } from '../database';

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

    let competition: Competition = await save([
        new Competition('CTFompetition')
    ])[0];

    let categories: Category[] = await save([
        new Category('BACH 1', 1),
        new Category('BACH 2', 2),
        new Category('BACH 3', 3),
        new Category('MAST 1', 4),
        new Category('MAST 2', 5)
    ]);

    let tags: Tag[] = await save([
        new Tag('Crypto', 'Yeah so this is like cryptography and stuff'),
        new Tag('Networking', 'WEB'),
        new Tag('idk anymore man', 'What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.')
    ]);

    //passwords are: "password"
    let accounts: Account[] = await save([
        new Account('John', '32ff8ac1d051d367f4da30853972b82d0730059ccf2bb11ad1a0d16543afe14b58ed7eb413ba570240175d9bdd62e566129b43993350e5ef1ffc99c8daf5b970', '3b15118335536a6cedf3cb0165a3c9da6f10aa61fd354dc49e36df65264f18e7', Roles.participant, categories[0]),
        new Account('Edward', '32ff8ac1d051d367f4da30853972b82d0730059ccf2bb11ad1a0d16543afe14b58ed7eb413ba570240175d9bdd62e566129b43993350e5ef1ffc99c8daf5b970', '3b15118335536a6cedf3cb0165a3c9da6f10aa61fd354dc49e36df65264f18e7', Roles.participant, categories[1]),
        new Account('Thomas', '32ff8ac1d051d367f4da30853972b82d0730059ccf2bb11ad1a0d16543afe14b58ed7eb413ba570240175d9bdd62e566129b43993350e5ef1ffc99c8daf5b970', '3b15118335536a6cedf3cb0165a3c9da6f10aa61fd354dc49e36df65264f18e7', Roles.participant, categories[2]),
        new Account('John 2', '32ff8ac1d051d367f4da30853972b82d0730059ccf2bb11ad1a0d16543afe14b58ed7eb413ba570240175d9bdd62e566129b43993350e5ef1ffc99c8daf5b970', '3b15118335536a6cedf3cb0165a3c9da6f10aa61fd354dc49e36df65264f18e7', Roles.participant, categories[3]),
        new Account('BOB!', '32ff8ac1d051d367f4da30853972b82d0730059ccf2bb11ad1a0d16543afe14b58ed7eb413ba570240175d9bdd62e566129b43993350e5ef1ffc99c8daf5b970', '3b15118335536a6cedf3cb0165a3c9da6f10aa61fd354dc49e36df65264f18e7', Roles.participant, categories[4])
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
