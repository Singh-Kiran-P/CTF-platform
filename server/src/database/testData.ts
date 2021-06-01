import DB, { Team, Competition, Category, Challenge, ChallengeType, Tag, Account, Round, Page, TeamRepoCustom, Sponsor, Hint, DockerManagement, DockerOpenPort, Question, Solve } from '../database';
import dotenv from 'dotenv';
dotenv.config();

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
        new Tag({ name: 'Programming', description: 'Programming challenges require you to write programs', order: 1 }),
        new Tag({ name: 'Crypto', description: 'Cryptography challenges focus on being able to decrypt encrypted data', order: 2 }),
        new Tag({ name: 'Networking', description: 'Networking challenges focus on all things to with the internet', order: 3 }),
        new Tag({ name: 'Binary', description: 'These challenhes will have you reverse engineering or exploiting a binary file', order: 4 }),
        new Tag({ name: 'Forensics', description: 'Forensics require you to analyze and dissect given attachments', order: 5 })
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
    let accounts: Account[] = await save([
        admin,
        new Account('Edward', 'pass', categories[0]),
        new Account('Johnathan', 'pass', categories[0]),
        new Account('Jeff', 'pass', categories[0]),
        new Account('Michael', 'pass', categories[0]),
        new Account('Thomas', 'pass', categories[1]),
        new Account('John', 'pass', categories[1]),
        new Account('Bob', 'pass', categories[1]),
        new Account('Brent', 'pass', categories[1]),
        new Account('Jay', 'pass', categories[1]),
        new Account('Jonas', 'pass', categories[1]),
        new Account('Tim', 'pass', categories[2]),
        new Account('Boris', 'pass', categories[2]),
        new Account('Chad', 'pass', categories[2]),
        new Account('Ronald', 'pass', categories[2])
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

    let rounds: Round[] = await save([
        round('The very beginning', 'In this round you will be getting familiar with the flow of a CTF competition.', -o * 3, -o * 2.5),
        round('The first hardships', 'Things will start to get harder in this round, try to keep up!', -o * 2, o * 1),
        round('A real challenge', 'Hope things weren\'t too hard so far, because they are getting even harder!', o * 4, o * 8),
        round('The final stretch', 'Don\'t give up now! This is the last round', o * 9, o * 11)
    ]);

    const challenge = (order: number, round: number, tag: number, quiz: boolean, points: number, flag: string, lock: number,
                       attachment: string, name: string, description: string) => new Challenge({
        order: order, round: rounds[round], tag: tags[tag], type: quiz ? ChallengeType.QUIZ : ChallengeType.BASIC, name: name, description: description, points: points, flag: flag,
        attachment: attachment, lock: lock, docker: '', dockerImageId: '', innerPorts: ''
    });

    let challenges: Challenge[] = await save([
        challenge(1, 0, 0, false, 2, 'FLAG', -1, '', 'Two sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.'),
        challenge(2, 0, 2, false, 3, 'FLAG', -1, '', 'Substring no repeating chars', 'Given a string s, find the length of the longest substring without repeating characters.'),
        challenge(1, 1, 3, false, 5, 'FLAG', -1, '/median of 2 sorted arrays/attachment/images.zip', 'Median of 2 sorted arrays', 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).'),
        challenge(2, 1, 3, false, 6, 'FLAG', -1, '/zigzag conversion/attachment/images.zip', 'ZigZag conversion', 'The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility)'),
        challenge(3, 1, 1, true, 10, 'FLAG', 2, '', 'Regular Expression Matching', 'Given an input string (s) and a pattern (p), implement regular expression matching with support for \'.\' and \'*\' where:  \'.\' Matches any single character.​​​​ \'*\' Matches zero or more of the preceding element. The matching should cover the entire input string (not partial).'),
        challenge(1, 2, 4, false, 7, 'FLAG', -1, '', 'Letter Combinations Phone Number', 'Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order. A mapping of digit to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.'),
        challenge(2, 2, 4, false, 10, 'FLAG', 1, '', 'Longest common prefix', 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string "".'),
        challenge(3, 2, 2, false, 15, 'FLAG', 2, '', 'Remove Nth Node From End of List', 'Given the head of a linked list, remove the nth node from the end of the list and return its head. Follow up: Could you do this in one pass?'),
        challenge(4, 2, 1, false, 20, 'FLAG', 3, '', 'Remove Duplicates from Sorted', 'Given a sorted array nums, remove the duplicates in-place such that each element appears only once and returns the new length. Do not allocate extra space for another array, you must do this by modifying the input array in-place with O(1) extra memory.'),
        challenge(1, 3, 3, false, 10, 'FLAG', -1, '', 'Substring with Concatenation',  'You are given a string s and an array of strings words of the same length. Return all starting indices of substring(s) in s that is a concatenation of each word in words exactly once, in any order, and without any intervening characters. You can return the answer in any order.'),
        challenge(2, 3, 0, false, 10, 'FLAG', 1, '', 'Valid Sudoku',  'Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules:'),
        challenge(3, 3, 3, false, 10, 'FLAG', 1, '', 'Pow(x, n)',  'Implement pow(x, n), which calculates x raised to the power n (i.e., xn).')
    ]);

    let hints: Hint[] = await save([
        new Hint({ challenge: challenges[3], order: 1, cost: 1, name: 'Tip to get you started', content: 'Maybe try to swap some things around' }),
        new Hint({ challenge: challenges[3], order: 2, cost: 4, name: 'Only for if you are stuck', content: 'You have to recusively converse the zig zag by swapping the values of neighbouring characters' })
    ]);

    let questions: Question[] = await save([
        new Question({ quiz: challenges[4], accuracy: 80, order: 1, question: 'What does this regex do? \'/([a-zA-Z0-9+)/g\'', answer: 'returns all numbers and letters\nreturns all letters and numbers\nnumbers and letters\nletters and numbers\nalphanumeric characters' }),
        new Question({ quiz: challenges[4], accuracy: 100, order: 2, question: 'Does this string match the regex? \'alphanumeric string\' \'/([a-zA-Z0-9+)/g\'', answer: 'no' })
    ]);

    let max = new Date().getTime();
    let min = new Date(rounds[1].start).getTime();
    let r = (l: number, u: number) => Math.floor(Math.random() * (u - l + 1) + l);
    await save([...Array(6).keys()].map(() => new Solve(challenges[r(2, 4)], teams[r(0, 5)], new Date(r(min, max)).toJSON())));

    let dockerManagement: DockerManagement = (await save([
        new DockerManagement(1000, 5000)
    ]))[0];

    let dockerOpenPort: DockerOpenPort[] = (await save([
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
