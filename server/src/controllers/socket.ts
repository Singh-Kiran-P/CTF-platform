/**
 * @auther Kiran Singh
 */
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

let io: Server<DefaultEventsMap, DefaultEventsMap>;
export default {
    init: (httpServer: any) => {
        io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: ["custom-header"],
                credentials: true
            }
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Websocket not initialized.');
        }
        return io;
    }
}
