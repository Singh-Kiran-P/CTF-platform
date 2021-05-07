/**
 * @auther Kiran Singh
 */
import { isAdmin, isAuth } from "@/auth";
import express from "express";
const router = express.Router();
import notificationController from "../controllers/notification";

router.get('/getAll', isAuth, notificationController.getAllNotifications_GET);

router.post('/send', isAdmin, notificationController.send_POST);

router.delete('/deleteById', isAdmin, notificationController.deleteById_DELETE);

router.delete('/deleteAll', isAdmin, notificationController.deleteAll_DELETE);

export default { path: '/notification', router };
