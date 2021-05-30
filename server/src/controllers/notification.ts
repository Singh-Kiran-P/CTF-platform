/**
 * @author Kiran Singh
 */
import { Request, Response } from 'express';
import DB, { Notification } from '../database';
import socketIO from './socket';

/**
 * This class handles notifications using socket.io
 */
export class NotificationController {

    constructor() {
        this.getAllNotifications_GET = this.getAllNotifications_GET.bind(this);
        this.send_POST = this.send_POST.bind(this);
        this.deleteById_DELETE = this.deleteById_DELETE.bind(this);
        this.deleteAll_DELETE = this.deleteAll_DELETE.bind(this);
    }

    /**
    * Route to all notifications from the db
    * @param req route request object
    * @param res route response object return
    * @category Routes
    */
    public getAllNotifications_GET(req: Request, res: Response) {
        let notificationRepo = DB.repo(Notification);
        notificationRepo
            .find()
            .then((data) => {
                res.json(data);
            })
            .catch(() => res.json({ message: 'Error retrieving notifications', statusCode: 404 }));
    }

    /**
    * Route to send notifications
    *   - save notification into db
    *   - emit a socket to channel 'notification'
    * @param req route request object
    * @param res route response object
    * @category Routes
    */
    public send_POST(req: Request, res: Response) {
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

    /**
    * Route to delete notification
    *   - delete from db
    *   - emit a socket to channel 'notificationUpdate'
    * @param req route request object
    * @param res route response object
    * @category Routes
    */
    public deleteById_DELETE(req: Request, res: Response) {
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

    /**
    * Route to delete all notifications
    * @param req route request object
    * @param res route response object
    * @category Routes
    */
    public deleteAll_DELETE(req: Request, res: Response) {
        DB.conn.query('DELETE FROM Notification;').then(() => {
            // emit socket
            let socket = socketIO.getIO();
            socket.emit('notificationUpdate', {});
            res.json({ message: 'All notifications deleted successfully!', statusCode: 200 });
        })
            .catch(() => res.json({ message: 'Error deleting notifications', statusCode: 404 }));
    }
}
