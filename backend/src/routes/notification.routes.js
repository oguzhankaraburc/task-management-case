const { verifyToken } = require('../middlewares/auth.middleware');
const controller = require('../controllers/notification.controller');

module.exports = function (app) {
    app.get('/api/notifications', [verifyToken], controller.getNotifications);
    app.put('/api/notifications/read-all', [verifyToken], controller.markAllAsRead);
    app.put('/api/notifications/:id/read', [verifyToken], controller.markAsRead);
    app.delete('/api/notifications/:id', [verifyToken], controller.deleteNotification);
};
