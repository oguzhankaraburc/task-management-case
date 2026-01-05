const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const controller = require('../controllers/task.controller');

module.exports = function (app) {
    app.post('/api/tasks', [verifyToken], controller.createTask);
    app.get('/api/tasks/my', [verifyToken], controller.getMyTasks);
    app.get('/api/tasks/all', [verifyToken], controller.getAllTasks);
    app.patch('/api/tasks/:id/status', [verifyToken], controller.updateStatus);
    app.put('/api/tasks/:id', [verifyToken], controller.updateTask);
    app.delete('/api/tasks/:id', [verifyToken], controller.deleteTask);
};
