import { isAdmin, isAuth } from "@/auth";
import express from "express";
const router = express.Router();
import {LeaderBoardController} from "../controllers/leaderboard";
let controller = new LeaderBoardController();

router.post("/update", (res, req) => controller.update(res, req))

export default { path: '/leaderboard', router };
