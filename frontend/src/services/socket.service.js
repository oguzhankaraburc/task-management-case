import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    socket = null;

    connect(userId) {
        if (!this.socket) {
            this.socket = io(SOCKET_URL);

            this.socket.on('connect', () => {
                console.log('Connected to socket server');
                if (userId) {
                    this.socket.emit('register', userId);
                }
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from socket server');
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onNotification(callback) {
        if (this.socket) {
            this.socket.on('new_notification', (notification) => {
                callback(notification);
            });
        }
    }

    onStatsUpdate(callback) {
        if (this.socket) {
            this.socket.on('stats_update', () => {
                callback();
            });
        }
    }
}

const socketService = new SocketService();
export default socketService;
