let socket: any;
module.exports = {
    init: (httpServer: any) => {
        socket = require('socket.io')(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: ["custom-header"],
                credentials: true
            }
        });
        return socket;
    },
    getIO: () => {
        if (!socket) {
            throw new Error('Websocket not initialized.');
        }
        return socket;
    }
}
