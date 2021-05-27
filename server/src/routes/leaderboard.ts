import { isAdmin, isAuth } from "@/auth";
import express from "express";
import { Db } from "typeorm";
import DB, { Sponsor } from '../database';
const router = express.Router();
import {LeaderBoardController} from "../controllers/leaderboard";
let controller = new LeaderBoardController();

router.post("/update", controller.update);

router.get("/getAllData",controller.getAllData);

router.get("/sponsors", (req, res) => {
    DB.repo(Sponsor).find().then((sponsors: Sponsor[]) => {
        res.json({sponsors: sponsors});
    }).catch(() => res.json({error: "Cannot retrieve sponsors"}));
});

export default { path: '/leaderboard', router };
