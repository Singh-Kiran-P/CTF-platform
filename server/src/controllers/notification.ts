/**
 * @author Kiran Singh
 */
import { Request, Response } from 'express';
import DB, { Notification } from '../database';
import socketIO from './socket';

function getAllNotifications_GET(req: Request, res: Response) {
    let notificationRepo = DB.repo(Notification);
    notificationRepo
        .find()
        .then((data) => {
            res.json(data);
        })
        .catch(() => res.json({ message: 'Error retrieving notifications', statusCode: 404 }));
}

function send_POST(req: Request, res: Response) {
    let data = req.fields;

    let title: string = data.title.toString();
    let msg: string = data.msg.toString();

    //save to db
    let notificationRepo = DB.repo(Notification);
    let notification = new Notification(title, msg);
    notificationRepo.save(notification)
        .then((data) => {
            // emit socket
            let socket = socketIO.getIO();
            socket.emit('notification', data);
            res.json({ message: 'Notification sent successfully!', statusCode: 200 });
        })
        .catch(() => res.json({ message: 'Error sending notification', statusCode: 404 }));
}

function deleteById_DELETE(req: Request, res: Response) {
    let _id: number = Number(req.fields.id.toString());
    let notificationRepo = DB.repo(Notification);

    notificationRepo
        .delete({ id: _id })
        .then(() => {
            // emit socket
            let socket = socketIO.getIO();
            socket.emit('notificationUpdate', {});
            res.json({ message: 'Notification deleted successfully!', statusCode: 200 });
        })
        .catch(() => res.json({ message: 'Error deleting notification', statusCode: 404 }));
}

function deleteAll_DELETE(req: Request, res: Response) {
    DB.conn.query('DELETE FROM Notification;').then(() => {
        // emit socket
        let socket = socketIO.getIO();
        socket.emit('notificationUpdate', {});
        res.json({ message: 'All notifications deleted successfully!', statusCode: 200 });
    })
    .catch(() => res.json({ message: 'Error deleting notifications', statusCode: 404 }));
}

export default {
    getAllNotifications_GET,
    send_POST,
    deleteById_DELETE,
    deleteAll_DELETE
}
