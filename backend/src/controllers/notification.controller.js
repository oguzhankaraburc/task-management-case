const db = require('../models');
const Notification = db.Notification;

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { id: req.params.id, userId: req.userId } }
        );
        res.json({ message: 'Bildirim okundu olarak işaretlendi.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { userId: req.userId } }
        );
        res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await Notification.destroy({
            where: { id: req.params.id, userId: req.userId }
        });
        res.json({ message: 'Bildirim silindi.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
