/**
 * @author Kiran Singh
 */
import { Request, Response, NextFunction } from 'express';
import DB, { Account, Solve } from '../database';
import socketIO from './socket';

declare interface raw_data {
    uuid: string;
    name: string;
    solves: Solve[];
}

declare interface data_send {
    uuid: string;
    name: string;
    scores: { date: Date; score: number }[];
}

/**
 * This class handles the logic for leaderboard
 */
export class LeaderBoardController {
    teams: data_send[] = [];

    constructor() {
        this.generatedData = this.generatedData.bind(this);
        this.updateLeaderboard = this.updateLeaderboard.bind(this);
        this.update = this.update.bind(this);
        this.getAllData = this.getAllData.bind(this);
        this.generatedData();

    }

    /**
     * Update leaderboard [ with socket.io ]
     * @pre current score != previous score
     * @param account: to get team and cat.
     * @param score: current score of the team
     * @param timestamp
     */
    // TODO: @lander call this func after saving solve
    public updateLeaderboard(account: Account, score: number, timestamp: Date) {
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
        console.log(data);
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
                this.updateLeaderboard(acc, score, date);
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
        //TODO: get real data from @lander
        // let rawData:raw_data = getRawData();
        console.log(this.teams);
        res.json(this.teams);
    }

    /**
     * Create fake data for the leaderboard
     * @returns {Team[]}
     */
    public generatedData() {

        var team1_points = 0;
        var team2_points = 0;
        var team3_points = 0;

        this.teams.push({
            uuid: "1",
            name: "test1",
            scores: [],
        });
        this.teams.push({
            uuid: "2",
            name: "test2",
            scores: [],
        });
        this.teams.push({
            uuid: "3",
            name: "test3",
            scores: [],
        });

        for (var day = 0; day < 1; day++) {
            for (var hour = 0; hour < 5; hour++) {
                for (var minute = 0; minute < 60; minute += 30) {
                    team1_points += (minute + 5) * 2;
                    team2_points += (minute + 3) * 1.5;
                    team3_points += (minute + 3) * 3;

                    var newDate1 = new Date(2020, 0, day, hour, Math.floor(Math.random() * ((minute + 4) - minute + 1) + minute), 0);
                    var newDate2 = new Date(2020, 0, day, hour, Math.floor(Math.random() * ((minute + 4) - minute + 1) + minute), 0);
                    var newDate3 = new Date(2020, 0, day, hour, Math.floor(Math.random() * ((minute + 4) - minute + 1) + minute), 0);
                    console.log(newDate1);

                    this.teams[0].scores.push({
                        date: newDate1,
                        score: team1_points,
                    });
                    this.teams[1].scores.push({
                        date: newDate2,
                        score: team2_points,
                    });
                    this.teams[2].scores.push({
                        date: newDate3,
                        score: team3_points,
                    });
                }
            }
        }
        return this.teams;
    }
}
