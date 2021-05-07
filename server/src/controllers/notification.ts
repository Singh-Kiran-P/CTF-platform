/**
 * @auther Kiran Singh
 */
import { Request, Response, NextFunction } from 'express';
import DB, { Notification } from '../database';
import socketIO from './socket';

function getAllNotifications_GET(req: Request, res: Response) {
    let notificationRepo = DB.repo(Notification);
    notificationRepo
        .find()
        .then((data) => {
            res.json(data);
        })
        .catch(() => {
            res.send('error');
        });
}

function send_POST(req: Request, res: Response) {
    let data = req.fields;

    let title: string = data.title.toString();
    let msg: string = data.msg.toString();

    new Promise<void>(async (resolve, reject) => {
        //save to db
        let notificationRepo = DB.repo(Notification);
        let notification = new Notification(title, msg);
        await notificationRepo.save(notification);

        // emit socket
        let socket = socketIO.getIO();
        socket.emit('notification', data);
        console.log(data);
    })
        .then((data) => {
            res.json({ message: 'Notification send successfully!', statusCode: 205 });
        })
        .catch(() => {
            res.send('error');
        })

}

function deleteById_DELETE(req: Request, res: Response) {
    let _id: number = Number(req.fields.id.toString());
    console.log(_id);
    let notificationRepo = DB.repo(Notification);

    notificationRepo
        .delete({ id: _id })
        .then(() => {
            res.json({ message: 'Notification deleted successfully!', statusCode: 200 });
        })
        .catch((err) => {
            res.json({ message: err, statusCode: 404 });
        })

}

function deleteAll_DELETE(req: Request, res: Response) {
    DB.conn.query('DELETE FROM Notification;').then(() => {
        res.json({ message: 'All notifications deleted successfully!', statusCode: 200 });
    })
        .catch((err) => {
            res.json({ message: err, statusCode: 404 });
        })
}

export default {
    getAllNotifications_GET,
    send_POST,
    deleteById_DELETE,
    deleteAll_DELETE
}

