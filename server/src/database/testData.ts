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
        new Tag({ name: 'TODO MORE', description: 'TODO MORE', order: 3 }),
        new Tag({ name: 'TODO MORE', description: 'TODO MORE', order: 4 }),
        new Tag({ name: 'TODO MORE', description: 'TODO MORE', order: 5 })
    ]);

    let pages: Page[] = await save([
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
    let captains: Account[] = await save([
        admin,
        new Account('Edward', 'password', categories[0]),
        new Account('John', 'password', categories[1]),
        new Account('Bob', 'password', categories[1]),
        new Account('Ronald', 'password', categories[2])
    ]);

    const teamRepo = new TeamRepoCustom();
    let teams: Team[] = await Promise.all([
        teamRepo.saveWithCaptain('Edward\'s team', captains[1]),
        teamRepo.saveWithCaptain('Johmas', captains[2]),
        teamRepo.saveWithCaptain('Bob the coder', captains[3]),
        teamRepo.saveWithCaptain('Roland and Tim', captains[4])
    ]);

    let users: Account[] = await save([
        new Account('Thomas', 'password', categories[1], teams[1]),
        new Account('Tim', 'password', categories[2], teams[3])
    ]);

    const round = (name: string, description: string, start: Date, end: Date) => new Round({
        name: name, folder: '/rounds/' + name.toLowerCase(), description: description, start: start.toJSON(), end: end.toJSON()
    });

    let rounds: Round[] = await save([ // TODO DATES
        round('The very beginning', 'In this round you will be getting familiar with the flow of a CTF competition.', new Date(2021, 5, 1, 10), new Date(2021, 5, 1, 11)),
        round('The first hardships', 'Things will start to get harder in this round, try to keep up!', new Date(2021, 5, 1, 11, 30), new Date(2021, 5, 1, 13)),
        round('A real challenge', 'Hope things weren\'t too hard so far, because they are getting even harder!', new Date(2021, 5, 1, 14), new Date(2021, 5, 1, 16)),
        round('The final stretch', 'Don\'t give up now! This is the last round', new Date(2021, 5, 1, 17), new Date(2021, 5, 1, 18))
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
