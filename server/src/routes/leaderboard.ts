import { isAdmin, isAuth } from "@/auth";
import express from "express";
const router = express.Router();
import controller from "../controllers/leaderboard";

router.post("/update", controller.update)

export default { path: '/leaderboard', router };
