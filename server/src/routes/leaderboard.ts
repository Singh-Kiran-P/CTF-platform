/**
 * @author Kiran Singh
 */
import { isAdmin, isAuth } from "@/auth";
import express from "express";
import { Db } from "typeorm";
import DB, { Sponsor } from '../database';
const router = express.Router();
import { LeaderBoardController } from "../controllers/leaderboard";
let controller = new LeaderBoardController();

router.post("/update", controller.update);

router.get("/getAllData", controller.getAllData);

router.get("/sponsors", controller.getSponsorsData);

export default { path: '/leaderboard', router };
