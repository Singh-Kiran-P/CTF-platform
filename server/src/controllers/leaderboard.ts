/**
 * @author Kiran Singh
 */
import { Request, Response } from 'express';
import { solvePoints } from '@/routes/challenges';
import { sortRounds } from '@shared/validation/roundsForm';
import DB, { Account, Round, Sponsor, Team } from '../database';
import socketIO from './socket';

/**
 * Interface for the leaderboard data
 */
declare interface data_send {
    uuid: string;
    name: string;
    scores: { time: string; score: number }[];
    total: number;
}

/**
 * This class handles the logic for leaderboard
 */
export class LeaderBoardController {

    teams: data_send[] = [];

    constructor() {
        this.updateLeaderboard = this.updateLeaderboard.bind(this);
        this.update = this.update.bind(this);
        this.getAllData = this.getAllData.bind(this);
        this.getSponsorsData = this.getSponsorsData.bind(this);
    }

    /**
     * Update leaderboard [ with socket.io ]
     * @pre current score != previous score
     * @param account To get team and category.
     * @param score Current score of the team
     * @param timestamp
     */
    public updateLeaderboard(account: Account, score: number, timestamp: string) {
        let cat = account.category.name;
        socketIO.getIO().emit(cat, {
            cat: cat,
            teamId: account.team.id,
            teamName: account.team.name,
            score: score,
            timestamp: timestamp
        });
    }

    /**
     * Route to send fake socket emits to front-end [testing]
     * @param req route request object
     * @param res route response object
     * @category Routes
     */
    public update(req: Request, res: Response) {
        DB.repo(Account).findOne({ where: { id: req.fields.userId.toString() } })
            .then((acc) => {
                let score = Number.parseFloat(req.fields.score.toString());
                let date = new Date();

                //save data
                // this.teams[0].scores.push({ date, score });
                this.updateLeaderboard(acc, score, date.toJSON());
                res.send('oke');
            })
            .catch(err => res.json(err));
    }

    /**
    * Route to get data for the leaderboard
    * @param req route request object
    * @param res route response object
    * @category Routes
    * @returns {data_send[]} This is the response
    */
    public getAllData(req: Request, res: Response) {
        DB.repo(Team).find({ relations: ['accounts', 'solves', 'solves.challenge', 'usedHints', 'usedHints.challenge'] }).then(teams => {
            // TODO
            teams = teams.filter(team => team.getCategoryName() == req.params.cat);

            let teamsData: data_send[] = teams.map(team => ({
                uuid: team.id,
                name: team.name,
                scores: team.solves.map(solve => ({
                    time: solve.time,
                    score: solvePoints(team, solve)
                })),
                total: 0
            }));

            for (const team of teamsData) {
                let sum = 0;
                team.scores = team.scores.map(score => {
                    sum += score.score;
                    return Object.assign({}, score, { score: sum });
                });
                team.total = sum;
            }

            DB.repo(Round).find().then(rounds => {
                let startTime = rounds.reduce((acc, cur, i) => {
                    let start = new Date(cur.start);
                    return i == 0 || start < acc ? start : acc;
                }, new Date());
                for (const team of teamsData) {
                    team.scores.unshift({time: startTime.toISOString(), score:0 });
                }
                res.json({ teams: teamsData, startTime: startTime.toJSON() });
            }).catch(() => res.json({ error: 'Error retrieving data' }));
        }).catch(() => res.json({ error: 'Error retrieving data' }));
    }


    /**
    * Route to get sponsors data dat such as link, img path, etc.
    * @param req route request object
    * @param res route response object
    * @category Routes
    * @returns {Sponsor[]} This is the response
    */
    public getSponsorsData(req: Request, res: Response) {
        DB.repo(Sponsor).find().then((sponsors: Sponsor[]) => {
            res.json({ sponsors: sponsors });
        }).catch(() => {
            res.json({ message: "Cannot retrieve sponsors", statusCode: 404 })
        });
    }
}
