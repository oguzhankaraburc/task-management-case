let io;
const userSockets = new Map();

const init = (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('register', (userId) => {
            if (userId) {
                userSockets.set(userId.toString(), socket.id);
                console.log(`User ${userId} registered with socket ${socket.id}`);
            }
        });

        socket.on('disconnect', () => {
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

const emitToUser = (userId, event, data) => {
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
        io.to(socketId).emit(event, data);
        console.log(`Emitted ${event} to user ${userId}`);
    } else {
        console.log(`User ${userId} not connected, could not emit ${event}`);
    }
};

module.exports = {
    init,
    getIO,
    emitToUser
};
