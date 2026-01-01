const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../models');
const User = db.User;

const verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.userRole === 'Admin') {
        next();
        return;
    }
    return res.status(403).send({ message: 'Require Admin Role!' });
};

const authMiddleware = {
    verifyToken,
    isAdmin
};

module.exports = authMiddleware;
