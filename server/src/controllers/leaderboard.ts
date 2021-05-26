/**
 * @author Kiran Singh
 */
import { Request, Response, NextFunction } from 'express';
import DB, { Account } from '../database';
import socketIO from './socket';

/**
 * This class handles the logic for leaderboard
 */
export class LeaderBoardController {
    /**
     * Update leaderboard [ with socket.io ]
     * @pre current score != previous score
     * @param account: to get team and cat.
     * @param score: current score of the team
     * @param timestamp
     */
    public updateLeaderboard(account: Account, score: number, timestamp: number) {
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
     */
    public update(req: Request, res: Response) {
        DB.repo(Account).findOne({ where: { id: req.fields.userId.toString() } })
            .then((acc) => {
                let score = Number.parseFloat(req.fields.score.toString());
                let time = new Date().getTime();
                this.updateLeaderboard(acc, score, time);
                res.send("oke")
            })
            .catch(err => res.json(err));
    }
}

