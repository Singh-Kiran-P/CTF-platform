/**
 * @author Kiran Singh
 */
import { responseSolve, solvePoints } from '@/routes/challenges';
import { Request, Response } from 'express';
import DB, { Account, Solve, Sponsor, Team } from '../database';
import socketIO from './socket';

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

    }

    /**
     * Update leaderboard [ with socket.io ]
     * @pre current score != previous score
     * @param account: to get team and cat.
     * @param score: current score of the team
     * @param timestamp
     */
    public updateLeaderboard(account: Account, score: number, timestamp: string) {
        let cat = account.category.name;
        // emit socket
        let socket = socketIO.getIO();
        let data = {
            cat: cat,
            teamId: account.team.id,
            teamName: account.team.name,
            score: score,
            timestamp: timestamp
        }
        socket.emit(cat, data);
    }

    /**
     * Route to send fake socket emits to front-end
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
                res.send("oke")
            })
            .catch(err => res.json(err));
    }
    /**
    * Route to get data for the leaderboard
    * @param req route request object
    * @param res route response object
    * @category Routes
    * @returns {Team[]} This is the response
    */
    public getAllData(req: Request, res: Response) {

        DB.repo(Team).find({ relations: ['solves', 'solves.challenge', 'usedHints', 'usedHints.challenge'] })
            .then((teams) => {
                let data: data_send[] = teams.map(team => ({
                    uuid: team.id,
                    name: team.name,
                    scores: team.solves.map(solve => ({
                        time: solve.time,
                        score: solvePoints(team, solve)
                    })),
                    total: 0
                }));

                for (const teamData of data) {
                    let scores = teamData.scores
                    console.log(teamData.scores);

                    let sum = 0;
                    scores = scores.map(score => {
                        sum += score.score;
                        return Object.assign({}, score, { score: sum });
                    });
                    teamData.scores = scores;
                    teamData.total = sum;
                }
                res.json(data);
            })
    }


    /**
    * Route to get data sponsors dat such as link, img path, etc.
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
