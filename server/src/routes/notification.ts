import { isAdmin } from "@/auth";
import express from "express";
const router = express.Router();
import notificationController from "../controllers/notification";

router.get('/getAll', notificationController.getAllNotifications_GET);

router.post('/send', notificationController.send_POST);

router.delete('/deleteById', notificationController.deleteById_DELETE);

router.delete('/deleteAll', notificationController.deleteAll_DELETE);

export default { path: '/notification', router };
