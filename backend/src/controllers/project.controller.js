const db = require('../models');
const Project = db.Project;
const User = db.User;
const NotificationService = require('../services/notification.service');
const statsService = require('../services/stats.service');

exports.createProject = async (req, res) => {
    try {
        const { name, description, ownerId, startDate, endDate } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Proje adı zorunludur.', data: null });
        }

        const finalOwnerId = req.userRole === 'Admin' && ownerId ? ownerId : req.userId;

        const project = await Project.create({
            name,
            description,
            ownerId: finalOwnerId,
            startDate: startDate || null,
            endDate: endDate || null
        });

        statsService.clearStatsCache();
        res.status(201).json({ message: 'Proje başarıyla oluşturuldu.', data: project });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.getProjects = async (req, res) => {
    try {
        let projects;
        const include = [
            { model: User, as: 'owner', attributes: ['id', 'username', 'email', 'avatarUrl'] },
            { model: User, as: 'members', attributes: ['id', 'username', 'email', 'avatarUrl'], through: { attributes: ['role'] } }
        ];

        if (req.userRole === 'Admin') {
            projects = await Project.findAll({ include });
        } else {
            projects = await Project.findAll({
                include,
                where: {
                    [db.Sequelize.Op.or]: [
                        { ownerId: req.userId },
                        { '$members.id$': req.userId }
                    ]
                },
                subQuery: false
            });
        }
        res.status(200).json({ message: 'Projeler başarıyla getirildi.', data: projects });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, role } = req.body;

        const project = await Project.findByPk(projectId);
        if (!project) return res.status(404).json({ message: 'Proje bulunamadı.' });

        if (req.userRole !== 'Admin' && project.ownerId !== req.userId) {
            return res.status(403).json({ message: 'Bu projeye üye ekleme yetkiniz yok.' });
        }

        await db.ProjectMember.create({ projectId, userId, role: role || 'Member' });


        await NotificationService.createNotification(
            userId,
            'PROJECT_ASSIGN',
            'Yeni Proje Ataması',
            `"${project.name}" projesine eklendiniz.`,
            projectId
        );

        statsService.clearStatsCache();
        res.status(200).json({ message: 'Üye başarıyla eklendi.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        const project = await Project.findByPk(projectId);
        if (!project) return res.status(404).json({ message: 'Proje bulunamadı.' });

        if (req.userRole !== 'Admin' && project.ownerId !== req.userId) {
            return res.status(403).json({ message: 'Bu projeden üye çıkarma yetkiniz yok.' });
        }

        await db.ProjectMember.destroy({ where: { projectId, userId } });
        statsService.clearStatsCache();
        res.status(200).json({ message: 'Üye başarıyla çıkarıldı.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({ message: 'Proje bulunamadı.', data: null });
        }

        if (req.userRole !== 'Admin' && project.ownerId !== req.userId) {
            return res.status(403).json({ message: 'Bu projeyi silme yetkiniz yok.', data: null });
        }

        await project.destroy();
        statsService.clearStatsCache();
        res.status(200).json({
            message: 'Proje başarıyla silindi.',
            data: null
        });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, ownerId, startDate, endDate } = req.body;

        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: 'Proje bulunamadı.', data: null });
        }

        if (req.userRole !== 'Admin' && project.ownerId !== req.userId) {
            return res.status(403).json({ message: 'Bu projeyi güncelleme yetkiniz yok.', data: null });
        }

        await project.update({
            name: name || project.name,
            description: description || project.description,
            ownerId: (req.userRole === 'Admin' && ownerId) ? ownerId : project.ownerId,
            startDate: startDate !== undefined ? startDate : project.startDate,
            endDate: endDate !== undefined ? endDate : project.endDate
        });

        statsService.clearStatsCache();
        res.status(200).json({
            message: 'Proje başarıyla güncellendi.',
            data: project
        });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};
