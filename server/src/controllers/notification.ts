import DB, { Notification } from '../database';
import socketIO from './socket';

async function send(data: any) {
    let title: string = data.title;
    let msg: string = data.msg;

    //save to db
    let notificationRepo = DB.repo(Notification);
    let notification = new Notification(title, msg);
    await notificationRepo.save(notification);

    // emit socket

    let socket = socketIO.getIO();
    socket.emit('notification', data);
    console.log(data);

}

function getAllNotifications() {
    let notificationRepo = DB.repo(Notification);
    return notificationRepo.find({});
}

function deleteById(_id: number) {
    let notificationRepo = DB.repo(Notification);
    notificationRepo
    return notificationRepo.delete({ id: _id });

}

async function deleteAll() {
    await DB.conn.query('DELETE FROM Notification;');
}


export default {
    send,
    getAllNotifications,
    deleteById,
    deleteAll
}

