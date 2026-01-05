const db = require('../models');
const User = db.User;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const existingUser = await User.findOne({
            where: {
                [db.Sequelize.Op.or]: [{ username }, { email }]
            }
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'E-posta' : 'Kullanıcı adı';
            return res.status(400).json({
                message: `${field} zaten kullanımda.`,
                data: null
            });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'User'
        });

        res.status(201).json({
            message: 'Kullanıcı başarıyla oluşturuldu.',
            data: { id: user.id, username: user.username, email: user.email, role: user.role, avatarUrl: user.avatarUrl }
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu.', data: null });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.', data: null });
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({
                message: 'Hatalı şifre!',
                data: null
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
            process.env.JWT_SECRET,
            { expiresIn: 86400 }
        );

        res.status(200).json({
            message: 'Giriş başarılı.',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                accessToken: token
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email, password, avatarUrl } = req.body;
        const user = await User.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
        if (password) {
            updateData.password = await bcrypt.hash(password, 8);
        }

        await user.update(updateData);


        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
            process.env.JWT_SECRET,
            { expiresIn: 86400 }
        );

        res.status(200).json({
            message: 'Profil başarıyla güncellendi.',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                accessToken: token
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Lütfen bir dosya seçin.' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        res.status(200).json({
            message: 'Görsel başarıyla yüklendi.',
            data: { avatarUrl }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        const { Op } = db.Sequelize;
        let where = {};

        if (search) {
            where[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (role && role.toLowerCase() !== 'all') {
            where.role = role;
        }

        const users = await User.findAll({
            where,
            attributes: ['id', 'username', 'email', 'role', 'avatarUrl']
        });
        res.status(200).json({ message: 'Kullanıcı listesi getirildi.', data: users });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.', data: null });
        }

        const updateData = {
            username: username || user.username,
            email: email || user.email,
            role: role || user.role
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 8);
        }

        await user.update(updateData);

        res.status(200).json({
            message: 'Kullanıcı başarıyla güncellendi.',
            data: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.userId == id) {
            return res.status(400).json({ message: 'Kendi hesabınızı silemezsiniz.', data: null });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.', data: null });
        }

        if (user.role === 'Admin') {
            return res.status(400).json({ message: 'Yönetici (Admin) hesapları silinemez.', data: null });
        }

        await user.destroy();

        res.status(200).json({
            message: 'Kullanıcı başarıyla silindi.',
            data: null
        });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};


