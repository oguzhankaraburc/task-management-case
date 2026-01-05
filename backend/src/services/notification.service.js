const db = require('../models');
const Notification = db.Notification;
const socketService = require('./socket.service');

exports.createNotification = async (userId, type, title, message, relatedId = null) => {
    try {
        const notification = await Notification.create({
            userId: parseInt(userId),
            type,
            title,
            message,
            relatedId: relatedId ? parseInt(relatedId) : null
        });

        socketService.emitToUser(userId, 'new_notification', notification);

        return true;
    } catch (err) {
        console.error('[Notification] Error creating notification:', err.message);
        return false;
    }
};
