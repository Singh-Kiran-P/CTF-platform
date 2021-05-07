import { isAdmin } from "@/auth";
import express from "express";
const router = express.Router();
import notificationController from "../controllers/notification";

router.get('/getAll', (req, res) => {
    notificationController.getAllNotifications()
        .then((data) => {
            res.json(data);
        })
        .catch(() => {
            res.send('error');
        })
});

router.post('/send', (req, res) => {
    let data = req.fields;
    notificationController.send(data)
        .then((data) => {
            res.json({ message: 'Notification send successfully!', statusCode: 205 });
        })
        .catch(() => {
            res.send('error');
        })
});

router.delete('/delete', isAdmin, (req, res) => {
    let id: number = Number(req.fields.id.toString());
    console.log(id);

    notificationController.deleteById(id)
        .then(() => {
            res.json({ message: 'Notification deleted successfully!', statusCode: 200 });
        })
        .catch((err) => {
            res.json({ message: err, statusCode: 404 });
        })
});

router.delete('/deleteAll',  (req, res) => {
    notificationController.deleteAll().then(() => {
        res.json({ message: 'All notifications deleted successfully!', statusCode: 200 });
    })
        .catch((err) => {
            res.json({ message: err, statusCode: 404 });
        })
});

export default { path: '/notification', router };
