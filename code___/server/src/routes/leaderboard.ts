/**
 * @author Kiran Singh
 */
import express from "express";
const router = express.Router();
import { LeaderBoardController } from "../controllers/leaderboard";
let controller = new LeaderBoardController();


router.post("/update", controller.update);

router.get("/getAllData/:cat", controller.getAllData);

router.get("/sponsors", controller.getSponsorsData);

export default { path: '/leaderboard', router };
