const { verifyToken } = require('../middlewares/auth.middleware');
const controller = require('../controllers/project.controller');

module.exports = function (app) {
    app.post('/api/projects', [verifyToken], controller.createProject);
    app.get('/api/projects', [verifyToken], controller.getProjects);
};
