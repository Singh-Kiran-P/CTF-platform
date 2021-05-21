import DB, { Team, Competition, Category, Tag, Account, Page, Round } from '../database';
import { TeamRepoCustom } from './entities/accounts/Team';
import { Challenge } from './entities/challenges/Challenge';
import { ChallengeType } from '@shared/validation/roundsForm';

/**
 * loads test entries into the database
 * this function is called each time the database connection is made, after emptying the database
 */
async function loadTestData() {
    const save = async (entries: any[]): Promise<any[]> => {
        await DB.conn.manager.save(entries);
        return entries;
    }

    let competition: Competition = (await save([
        new Competition('CTFompetition')
    ]))[0];

    let pages: Page[] = await save([
        new Page({ name: 'Test', path: '/', source: '/pages/_page/testpage2.html', order: 1 })
    ]);

    let categories: Category[] = await save([
        new Category({ name: 'BACH 1', order: 1 }),
        new Category({ name: 'BACH 2', order: 2 }),
        new Category({ name: 'BACH 3', order: 3 }),
        new Category({ name: 'MAST 1', order: 4 }),
        new Category({ name: 'MAST 2', order: 5 })
    ]);

    let tags: Tag[] = await save([
        new Tag({ name: 'Crypto', description: 'Yeah so this is like cryptography and stuff', order: 1 }),
        new Tag({ name: 'Networking', description: 'WEB', order: 2 }),
        new Tag({ name: 'idk anymore man', description: 'What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.', order: 3 })
    ]);

    let rounds: Round[] = await save([
        new Round({ name: 'First round!!', folder: '/rounds/first round!!', description: 'haha teste te bal bla bla', start: new Date(2021, 5, 1, 10).toJSON(), end: new Date(2021, 5, 1, 11).toJSON() }),
        new Round({ name: 'GIVE IT UP FOR ROUND 22@', folder: '/rounds/give it up for round 22@', description: '', start: new Date(2021, 5, 1, 11, 30).toJSON(), end: new Date(2021, 5, 1, 12, 30).toJSON() }),
        new Round({ name: '~le tour final est arrivé~', folder: '/rounds/~le tour final est arrivé~', description: 'bim bom \n jaime la prevenir de ca telegrafeur\n\n\n                  ~~fantastique', start: new Date(2021, 5, 1, 13).toJSON(), end: new Date(2021, 5, 1, 14).toJSON() })
    ]);

    let challenges: Challenge[] = await save([
        new Challenge({ round: rounds[0], docker: '', dockerImageId: '', innerPorts: '', previous: -1, tag: tags[0], type: ChallengeType.BASIC, name: 'bruhrurh', description: 'it begin herere!!\nare you excite?? epic cool? ye yes\n\njust watch out it wil be hard', points: 5, flag: 'FLAG 1', attachment: '', order: 1 }),
        new Challenge({ round: rounds[0], docker: '', dockerImageId: '', innerPorts: '', previous: -1, tag: null, type: ChallengeType.BASIC, name: 'come have fun here! (', description: 'hoo good job!\n...\n\n         more coming :)', points: 5, flag: 'FLAG SECOND', attachment: '', order: 4 }),
        new Challenge({ round: rounds[1], docker: '', dockerImageId: '', innerPorts: '', previous: -1, tag: null, type: ChallengeType.BASIC, name: 'contitnitueing!', description: 'haha yes hope you liked your break becuas eits babaout to get WILD!  CRAZY!', points: 10, flag: 'cool flag B)', attachment: '', order: 4 }),
        new Challenge({ round: rounds[1], docker: '', dockerImageId: '', innerPorts: '', previous: -1, tag: tags[0], type: ChallengeType.BASIC, name: 'thius is onlyly the begine', description: 'harder and harder it will get yeees', points: 15, flag: 'mmmmMMMMMMMMMMMMMMMMMMMMMM!', attachment: '', order: 3 }),
        new Challenge({ round: rounds[1], docker: '', dockerImageId: '', innerPorts: '', previous: -1, tag: null, type: ChallengeType.BASIC, name: 'warm up cuz abotu to get stemey', description: 'i was just joking this one dont even got points LMAO\n\n\n\n\n\nepic owned', points: 0, flag: 'usesless flag LOL', attachment: '', order: 1 }),
        new Challenge({ round: rounds[1], docker: '', dockerImageId: '', innerPorts: '', previous: -1, tag: tags[1], type: ChallengeType.BASIC, name: 'haha finif', description: 'BOO! yeah now it s hard cunt watch out ccd', points: 20, flag: 'haha you wont even find this i bet', attachment: '', order: 7 }),
        new Challenge({ round: rounds[2], docker: '', dockerImageId: '', innerPorts: '', previous: -1, tag: tags[2], type: ChallengeType.BASIC, name: 'huhgg FIN#', description: 'Quest-ce que Lorem Ipsum? Lorem Ipsum est simplement un faux texte de lindustrie de limpression et de la composition. Lorem Ipsum a été le texte factice standard de lindustrie depuis les années 1500, quand un imprimeur inconnu a pris une galère de caractères et la brouillée pour en faire un livre de spécimens. Il a survécu non seulement cinq siècles, mais aussi le saut dans la composition électronique, demeurant essentiellement inchangé. Il a été popularisé dans les années 1960 avec la sortie de feuilles Letraset contenant des passages du Lorem Ipsum, et plus récemment avec un logiciel de publication assistée par ordinateur comme Aldus PageMaker comprenant des versions de Lorem Ipsum.', points: 999, flag: 'tres bon', attachment: '', order: 2 })
    ]);

    let admin = new Account('admin', 'password');
    admin.admin = true;
    let accounts: Account[] = await save([
        admin,
        new Account('John', 'password', categories[0]),
        new Account('Edward', 'password', categories[1]),
        new Account('Thomas', 'password', categories[2]),
        new Account('John 2', 'password', categories[3]),
        new Account('BOB!', 'password', categories[4])
    ]);

    const teamRepo = new TeamRepoCustom;
    let teams: Team[] = [teamRepo.saveWithCaptain('Team 1', accounts[1]),
    teamRepo.saveWithCaptain('Team 2', accounts[2]),
    teamRepo.saveWithCaptain('Team 3', accounts[3])];

    /*
    let teams: Team[] = await save([
        new Team('Team 1', accounts[1]),
        new Team('Team 2', accounts[2]),
        new Team('Team 3', accounts[3])
    ]);
    */
    /*
    for (let i = 0; i < accounts.length; ++i) { // give every account a team, COMMENT IF TESTING TEAM CONSTRUCTOR
        accounts[i].team = teams[Math.round(i * (teams.length - 1) / (accounts.length - 1))];
        await DB.repo(Account).update(accounts[i].id, accounts[i]);
    }*/
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
