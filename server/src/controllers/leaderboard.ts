/**
 * @author Kiran Singh
 */
import { Request, Response, NextFunction } from 'express';
import DB, { Account } from '../database';
import socketIO from './socket';

/**
 * Update leaderboard [ with socket.io]
 * @pre current score != previous score
 * @param account: to get team and cat.
 * @param score: current score of the team
 * @param timestamp
 */
function updateLeaderboard(account: Account, score: number, timestamp: number) {
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

function update(req: Request, res: Response) {
    DB.repo(Account).findOne({ where: { id: req.fields.userId.toString() } })
        .then((acc) => {
            let score = Number.parseFloat(req.fields.score.toString());
            let time = new Date().getTime();
            updateLeaderboard(acc, score, time);
            res.send("oke")
        })
        .catch(err => res.json(err));
}



export default {
    updateLeaderboard,
    update
}

