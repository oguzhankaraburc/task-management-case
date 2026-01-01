const controller = require('../controllers/auth.controller');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    app.post('/api/auth/register', controller.register);
    app.post('/api/auth/login', controller.login);

    const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
    app.get('/api/auth/users', [verifyToken, isAdmin], controller.getAllUsers);
    app.post('/api/auth/users', [verifyToken, isAdmin], controller.register);
};
