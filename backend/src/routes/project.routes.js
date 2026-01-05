const { verifyToken } = require('../middlewares/auth.middleware');
const controller = require('../controllers/project.controller');

module.exports = function (app) {
    app.post('/api/projects', [verifyToken], controller.createProject);
    app.get('/api/projects', [verifyToken], controller.getProjects);
    app.put('/api/projects/:id', [verifyToken], controller.updateProject);
    app.delete('/api/projects/:id', [verifyToken], controller.deleteProject);

    app.post('/api/projects/:projectId/members', [verifyToken], controller.addMember);
    app.delete('/api/projects/:projectId/members/:userId', [verifyToken], controller.removeMember);
};
