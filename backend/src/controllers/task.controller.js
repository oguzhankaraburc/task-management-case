const db = require('../models');
const Task = db.Task;
const Project = db.Project;
const User = db.User;
const NotificationService = require('../services/notification.service');
const statsService = require('../services/stats.service');


const ALLOWED_STATUS = ['Todo', 'In Progress', 'Done', 'Overdue'];
const ALLOWED_PRIORITY = ['Low', 'Medium', 'High'];


const cleanInput = (val) => {
    if (val === null || val === undefined) return null;
    const s = String(val).trim();
    if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined' || s.toLowerCase() === 'invalid date') return null;
    return s;
};

const validateDate = (date) => {
    const cleaned = cleanInput(date);
    if (!cleaned) return null;

    try {
        const d = new Date(cleaned);
        if (isNaN(d.getTime())) return null;
        return d;
    } catch (e) {
        return null;
    }
};


const checkAndMarkOverdue = async (tasks) => {
    const now = new Date();
    const overdueTasks = tasks.filter(task =>
        task.status !== 'Done' &&
        task.status !== 'Overdue' &&
        task.dueDate &&
        new Date(task.dueDate) < now
    );

    if (overdueTasks.length > 0) {
        await Promise.all(overdueTasks.map(async (task) => {
            await task.update({ status: 'Overdue' });
            if (task.assignedUserId) {
                await NotificationService.createNotification(
                    task.assignedUserId,
                    'TASK_OVERDUE',
                    'Gecikme Alarmı!',
                    `"${task.title}" görevinin süresi doldu.`,
                    task.id
                );
            }
        }));
    }
};

exports.createTask = async (req, res) => {
    try {
        let { title, description, status, priority, projectId, assignedUserId, startDate, dueDate } = req.body;

        assignedUserId = cleanInput(assignedUserId);
        startDate = validateDate(startDate);
        dueDate = validateDate(dueDate);

        if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
            return res.status(400).json({ message: 'Bitiş tarihi başlangıç tarihinden önce olamaz.', data: null });
        }

        if (!title) {
            return res.status(400).json({ message: 'Görev başlığı zorunludur.', data: null });
        }
        if (status && !ALLOWED_STATUS.includes(status)) {
            return res.status(400).json({ message: 'Geçersiz durum değeri.', data: null });
        }
        if (priority && !ALLOWED_PRIORITY.includes(priority)) {
            return res.status(400).json({ message: 'Geçersiz öncelik değeri.', data: null });
        }

        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proje bulunamadı.', data: null });
        }

        const isMember = await db.ProjectMember.findOne({
            where: { projectId, userId: req.userId }
        });

        if (req.userRole !== 'Admin' && project.ownerId !== req.userId && !isMember) {
            return res.status(403).json({ message: 'Bu projeye görev ekleme yetkiniz yok.', data: null });
        }

        if (assignedUserId) {
            const isAssignedMember = await db.ProjectMember.findOne({
                where: { projectId, userId: assignedUserId }
            });
            const isOwner = project.ownerId === parseInt(assignedUserId);

            if (!isAssignedMember && !isOwner) {
                return res.status(400).json({ message: 'Atanan kullanıcı bu projenin üyesi değil.', data: null });
            }
        }

        const task = await Task.create({
            title,
            description,
            status: status || 'Todo',
            priority: priority || 'Medium',
            projectId,
            assignedUserId,
            startDate,
            dueDate,
            creatorId: req.userId
        });

        if (assignedUserId) {
            await NotificationService.createNotification(
                assignedUserId,
                'TASK_ASSIGN',
                'Yeni Görev Ataması',
                `"${title}" görevi size atandı.`,
                task.id
            );
        }

        statsService.clearStatsCache();
        res.status(201).json({ message: 'Görev başarıyla oluşturuldu.', data: task });
    } catch (error) {
        console.error('[Task] Create Error:', error);
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        let { title, description, status, priority, assignedUserId, startDate, dueDate } = req.body;

        assignedUserId = assignedUserId !== undefined ? cleanInput(assignedUserId) : undefined;
        startDate = startDate !== undefined ? validateDate(startDate) : undefined;
        dueDate = dueDate !== undefined ? validateDate(dueDate) : undefined;

        const task = await Task.findByPk(id, { include: [Project] });
        if (!task) {
            return res.status(404).json({ message: 'Görev bulunamadı.', data: null });
        }

        const oldAssignedUserId = task.assignedUserId;

        const isAuthorized =
            req.userRole === 'Admin' ||
            (task.project && task.project.ownerId === req.userId) ||
            task.creatorId === req.userId ||
            task.assignedUserId === req.userId;

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Bu görevi düzenleme yetkiniz yok.', data: null });
        }

        if (title === '') return res.status(400).json({ message: 'Başlık boş olamaz.', data: null });
        if (status && !ALLOWED_STATUS.includes(status)) {
            return res.status(400).json({ message: 'Geçersiz durum değeri.', data: null });
        }
        if (priority && !ALLOWED_PRIORITY.includes(priority)) {
            return res.status(400).json({ message: 'Geçersiz öncelik değeri.', data: null });
        }

        const finalStart = startDate !== undefined ? startDate : task.startDate;
        const finalDue = dueDate !== undefined ? dueDate : task.dueDate;
        if (finalStart && finalDue && new Date(finalDue) < new Date(finalStart)) {
            return res.status(400).json({ message: 'Bitiş tarihi başlangıç tarihinden önce olamaz.', data: null });
        }

        await task.update({
            title: title || task.title,
            description: description !== undefined ? description : task.description,
            status: status || task.status,
            priority: priority || task.priority,
            assignedUserId: assignedUserId !== undefined ? assignedUserId : task.assignedUserId,
            startDate: startDate !== undefined ? startDate : task.startDate,
            dueDate: dueDate !== undefined ? dueDate : task.dueDate
        });

        if (assignedUserId && parseInt(assignedUserId) !== parseInt(oldAssignedUserId)) {
            await NotificationService.createNotification(
                assignedUserId,
                'TASK_ASSIGN',
                'Yeni Görev Ataması',
                `"${task.title}" görevi size atandı.`,
                task.id
            );
        }

        statsService.clearStatsCache();
        res.status(200).json({ message: 'Görev başarıyla güncellendi.', data: task });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !ALLOWED_STATUS.includes(status)) {
            return res.status(400).json({ message: 'Geçersiz durum değeri.', data: null });
        }

        const task = await Task.findByPk(id, { include: [Project] });
        if (!task) {
            return res.status(404).json({ message: 'Görev bulunamadı.', data: null });
        }

        const isAuthorized =
            req.userRole === 'Admin' ||
            task.project.ownerId === req.userId ||
            task.assignedUserId === req.userId;

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Bu görevin durumunu güncelleme yetkiniz yok.', data: null });
        }

        task.status = status;
        await task.save();

        statsService.clearStatsCache();
        res.status(200).json({ message: 'Görev durumu güncellendi.', data: task });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByPk(id, { include: [Project] });

        if (!task) {
            return res.status(404).json({ message: 'Görev bulunamadı.', data: null });
        }

        const isAuthorized =
            req.userRole === 'Admin' ||
            (task.project && task.project.ownerId === req.userId) ||
            task.creatorId === req.userId ||
            task.assignedUserId === req.userId;

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Bu görevi silme yetkiniz yok.', data: null });
        }

        await task.destroy();
        statsService.clearStatsCache();
        res.status(200).json({ message: 'Görev başarıyla silindi.', data: null });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.getMyTasks = async (req, res) => {
    try {
        let where = {};

        if (req.userRole !== 'Admin') {
            const owned = await Project.findAll({ where: { ownerId: req.userId }, attributes: ['id'], raw: true });
            const memberships = await db.ProjectMember.findAll({ where: { userId: req.userId }, attributes: ['projectId'], raw: true });
            const accessibleProjectIds = [...new Set([...owned.map(p => p.id), ...memberships.map(m => m.projectId)])].filter(id => id != null);

            where = {
                [db.Sequelize.Op.or]: [
                    { assignedUserId: req.userId },
                    { creatorId: req.userId },
                    { projectId: { [db.Sequelize.Op.in]: accessibleProjectIds } }
                ]
            };
        }

        const tasks = await Task.findAll({
            where,
            include: [
                { model: Project, attributes: ['id', 'name', 'ownerId'] },
                { model: User, as: 'assignedUser', attributes: ['username', 'avatarUrl'] }
            ]
        });

        await checkAndMarkOverdue(tasks);

        res.status(200).json({ message: 'Görevler başarıyla getirildi.', data: tasks });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        const { search } = req.query;
        let where = {};

        if (req.userRole !== 'Admin') {
            const ownedProjects = await Project.findAll({
                where: { ownerId: req.userId },
                attributes: ['id']
            });

            const memberProjects = await Project.findAll({
                attributes: ['id'],
                include: [{
                    model: User,
                    as: 'members',
                    where: { id: req.userId },
                    attributes: [],
                    through: { attributes: [] }
                }]
            });

            const projectIds = [
                ...ownedProjects.map(p => p.id),
                ...memberProjects.map(p => p.id)
            ];

            where = {
                [db.Sequelize.Op.or]: [
                    { assignedUserId: req.userId },
                    { projectId: { [db.Sequelize.Op.in]: projectIds } }
                ]
            };
        }

        if (search) {
            const searchCondition = {
                [db.Sequelize.Op.or]: [
                    { title: { [db.Sequelize.Op.like]: `%${search}%` } },
                    { description: { [db.Sequelize.Op.like]: `%${search}%` } }
                ]
            };

            if (Object.keys(where).length > 0) {
                where = { [db.Sequelize.Op.and]: [where, searchCondition] };
            } else {
                where = searchCondition;
            }
        }

        const tasks = await Task.findAll({
            where,
            include: [
                { model: Project, attributes: ['id', 'name', 'ownerId'] },
                { model: User, as: 'assignedUser', attributes: ['username', 'avatarUrl'] }
            ]
        });

        await checkAndMarkOverdue(tasks);

        res.status(200).json({ message: 'Tüm görevler başarıyla getirildi.', data: tasks });
    } catch (error) {
        res.status(500).json({ message: error.message, data: null });
    }
};
