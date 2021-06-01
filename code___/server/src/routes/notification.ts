/**
 * @author Kiran Singh
 */
import { isAdmin, isAuth } from "@/auth";
import express from "express";
const router = express.Router();
import { NotificationController } from "../controllers/notification";
let controller = new NotificationController();

router.get('/getAll', isAuth, controller.getAllNotifications_GET);

router.post('/send', isAdmin, controller.send_POST);

router.delete('/deleteById',isAdmin, controller.deleteById_DELETE);

router.delete('/deleteAll', isAdmin, controller.deleteAll_DELETE);

export default { path: '/notification', router };
