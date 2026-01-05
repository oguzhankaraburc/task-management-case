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
    app.put('/api/auth/profile', [require('../middlewares/auth.middleware').verifyToken], controller.updateProfile);

    const upload = require('../middlewares/upload.middleware');
    app.post('/api/auth/upload', [require('../middlewares/auth.middleware').verifyToken, upload.single('avatar')], controller.uploadAvatar);

    const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
    app.get('/api/auth/users', [verifyToken, isAdmin], controller.getAllUsers);
    app.post('/api/auth/users', [verifyToken, isAdmin], controller.register);
    app.put('/api/auth/users/:id', [verifyToken, isAdmin], controller.updateUser);
    app.delete('/api/auth/users/:id', [verifyToken, isAdmin], controller.deleteUser);
};
