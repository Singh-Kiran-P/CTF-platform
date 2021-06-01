import DB, { Team, Competition, Category, Challenge, ChallengeType, Tag, Account, Round, Page, TeamRepoCustom, Sponsor, Hint, DockerManagement, DockerOpenPort } from '../database';
import dotenv from 'dotenv';
import { Question } from '@shared/validation/roundsForm';
dotenv.config();

// TODO: good test data

/**
 * loads test entries into the database
 * this function is called each time the database connection is made, after emptying the database
 */
async function loadTestData() {
    const save = async (entries: any[]): Promise<any[]> => await DB.conn.manager.save(entries);

    let competition: Competition = (await save([
        new Competition('CTF Demo')
    ]))[0];

    let categories: Category[] = await save([
        new Category({ name: 'Bach 1', order: 1 }),
        new Category({ name: 'Bach 2', order: 2 }),
        new Category({ name: 'Bach 3', order: 3 })
    ]);

    let tags: Tag[] = await save([
        new Tag({ name: 'Crypto', description: 'Cryptography challenges focus on being able to decrypt encrypted data', order: 1 }),
        new Tag({ name: 'Networking', description: 'Networking challenges focus on all things to with the internet', order: 2 }),
        new Tag({ name: 'Programming', description: 'Programming challenges require you to write programs', order: 3 }),
        new Tag({ name: 'Forensics', description: 'Forensics require you to analyze and dissect given attachments', order: 4 })
    ]);

    let pages: Page[] = await save([ // TODO
        new Page({ name: 'Home', path: '/', source: '/pages/_page/index.html', order: 1 }),
        new Page({ name: 'About', path: '/about', source: '/pages/about/_page/index.html', order: 2 })
    ]);

    let sponsors: Sponsor[] = (await save([
        new Sponsor({ name: 'Cegeka', link: 'https://www.cegeka.com/nl-be/', icon: '/sponsors/cegeka/logo_cegeka_w.png', order: 1 }),
        new Sponsor({ name: 'IBM', link: 'https://www.ibm.com/be-en', icon: '/sponsors/ibm/ibm-banner.jpg', order: 2 }),
        new Sponsor({ name: 'EDM UHasselt', link: 'https://www.uhasselt.be/edm', icon: '/sponsors/edm uhasselt/EDM-logo.png', order: 3 }),
        new Sponsor({ name: 'Intigriti', link: 'https://www.intigriti.com/', icon: '/sponsors/intigriti/intigriti.png', order: 4 }),
        new Sponsor({ name: 'Potvos', link: 'https://www.cordacampus.com/en/cordacompanies/potvos/', icon: '/sponsors/potvos/Potvos_logo.png', order: 5 }),
        new Sponsor({ name: 'UHasselt faculty of sciences', link: 'https://www.uhasselt.be/fac-wetenschappen', icon: '/sponsors/uhasselt faculty of sciences/uh-wet.png', order: 6 })
    ]));

    let admin = new Account('admin', process.env.ADMIN_PASSWORD);
    admin.admin = true;
    let accounts: Account[] = await save([
        admin,
        new Account('Edward', 'password', categories[0]),
        new Account('Johnathan', 'password', categories[0]),
        new Account('Jeff', 'password', categories[0]),
        new Account('Michael', 'password', categories[0]),
        new Account('Thomas', 'password', categories[1]),
        new Account('John', 'password', categories[1]),
        new Account('Bob', 'password', categories[1]),
        new Account('Brent', 'password', categories[1]),
        new Account('Jay', 'password', categories[1]),
        new Account('Bob', 'password', categories[1]),
        new Account('Tim', 'password', categories[2]),
        new Account('Boris', 'password', categories[2]),
        new Account('Chad', 'password', categories[2]),
        new Account('Ronald', 'password', categories[2])
    ]);

    const teamRepo = new TeamRepoCustom();
    let teams: Team[] = await Promise.all([
        teamRepo.saveWithCaptain('Edward\'s team', accounts[1], []),
        teamRepo.saveWithCaptain('CTF Experts', accounts[2], [accounts[3], accounts[4]]),
        teamRepo.saveWithCaptain('Johmas', accounts[5], [accounts[6]]),
        teamRepo.saveWithCaptain('Bob the coder', accounts[7], []),
        teamRepo.saveWithCaptain('The challengers', accounts[8], [accounts[9], accounts[10]]),
        teamRepo.saveWithCaptain('The old crew', accounts[11], [accounts[12], accounts[13], accounts[14]])
    ]);

    let o = 1000 * 60 * 30;
    let t = new Date().getTime();
    const round = (name: string, description: string, start: number, end: number) => new Round({
        name: name, folder: '/rounds/' + name.toLowerCase(), description: description, start: new Date(t + start).toJSON(), end: new Date(t + end).toJSON()
    });

    let rounds: Round[] = await save([ // TODO DATES
        round('The very beginning', 'In this round you will be getting familiar with the flow of a CTF competition.', -o / 2, o / 2),
        round('The first hardships', 'Things will start to get harder in this round, try to keep up!', o * 2, o * 4),
        round('A real challenge', 'Hope things weren\'t too hard so far, because they are getting even harder!', o * 7, o * 10),
        round('The final stretch', 'Don\'t give up now! This is the last round', o * 12, o * 14)
    ]);

    const challenge = (order: number, round: number, tag: number, type: ChallengeType,
                       name: string, description: string, points: number, flag: string, attachment: string, lock: number) => new Challenge({
        order: order, round: rounds[round], tag: tags[tag], type: type, name: name, description: description, points: points, flag: flag, attachment: attachment, lock: lock,
        docker: '', dockerImageId: '', innerPorts: ''
    });

    let challenges: Challenge[] = await save([ // TODO
        challenge(1, 0, 0, ChallengeType.BASIC, 'name1', 'description', 5, 'FLAG', '', -1),
        challenge(2, 0, 0, ChallengeType.BASIC, 'name2', 'description', 5, 'FLAG', '', -1),
        challenge(3, 1, 0, ChallengeType.BASIC, 'name3', 'description', 5, 'FLAG', '', -1),
        challenge(4, 1, 0, ChallengeType.BASIC, 'name4', 'description', 5, 'FLAG', '', -1),
        challenge(5, 1, 0, ChallengeType.BASIC, 'name5', 'description', 5, 'FLAG', '', -1),
        challenge(6, 2, 0, ChallengeType.BASIC, 'name6', 'description', 5, 'FLAG', '', -1),
        challenge(7, 2, 0, ChallengeType.BASIC, 'name7', 'description', 5, 'FLAG', '', -1),
        challenge(8, 2, 0, ChallengeType.BASIC, 'name8', 'description', 5, 'FLAG', '', -1),
        challenge(9, 2, 0, ChallengeType.BASIC, 'name9', 'description', 5, 'FLAG', '', -1),
        challenge(10, 3, 0, ChallengeType.BASIC, 'name10', 'description', 5, 'FLAG', '', -1),
        challenge(11, 3, 0, ChallengeType.BASIC, 'name11', 'description', 5, 'FLAG', '', -1),
        challenge(12, 3, 0, ChallengeType.BASIC, 'name12', 'description', 5, 'FLAG', '', -1)
    ]);

    let hints: Hint[] = await save([ // TODO
        
    ]);

    let questions: Question[] = await save([ // TODO

    ]);

    let dockerManagement: DockerManagement = (await save([
        new DockerManagement(1000, 5000)
    ]))[0];

    let dockerOpenPort: DockerOpenPort[] = (await save([ // TODO keep hardcoded?
        new DockerOpenPort(80), // vue server
        new DockerOpenPort(Number.parseInt(process.env.SERVER_PORT)), // node server
        new DockerOpenPort(Number.parseInt(process.env.DB_PORT)), // postgresSQL
        new DockerOpenPort(8080), // pgAdmin
        new DockerOpenPort(8000), // docker portainer
        new DockerOpenPort(9000) // docker portainer
    ]));
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
