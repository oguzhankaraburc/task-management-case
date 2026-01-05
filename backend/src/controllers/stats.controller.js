const db = require('../models');
const Task = db.Task;
const Project = db.Project;
const User = db.User;
const statsService = require('../services/stats.service');

const CACHE_TTL = 30 * 1000;

exports.getStats = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const cacheKey = userRole === 'Admin' ? 'Admin' : userId;

        const cached = statsService.getCachedStats(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return res.status(200).json({
                message: 'İstatistikler başarıyla getirildi (Önbellekten).',
                data: cached.data
            });
        }

        let projects = [];
        let tasks = [];

        if (userRole === 'Admin') {
            projects = await Project.findAll({
                include: [{ model: Task, attributes: ['status', 'dueDate'] }]
            });
            tasks = await Task.findAll();
        } else {
            projects = await Project.findAll({
                include: [
                    {
                        model: User,
                        as: 'members',
                        attributes: [],
                        through: { attributes: [] }
                    },
                    {
                        model: Task,
                        attributes: ['status', 'dueDate']
                    }
                ],
                where: {
                    [db.Sequelize.Op.or]: [
                        { ownerId: userId },
                        { '$members.id$': userId }
                    ]
                },
                subQuery: false
            });

            const projectIds = projects.map(p => p.id);
            tasks = await Task.findAll({
                where: {
                    [db.Sequelize.Op.or]: [
                        { assignedUserId: userId },
                        { projectId: { [db.Sequelize.Op.in]: projectIds } }
                    ]
                }
            });
        }

        if (!projects) projects = [];
        if (!tasks) tasks = [];

        const now = new Date();
        const statsMap = { Todo: 0, 'In Progress': 0, Done: 0, Overdue: 0 };

        tasks.forEach(task => {
            if (!task) return;
            let status = task.status;
            if (status !== 'Done' && status !== 'Overdue' && task.dueDate && new Date(task.dueDate) < now) {
                status = 'Overdue';
            }
            if (statsMap[status] !== undefined) {
                statsMap[status]++;
            }
        });

        const statusDistribution = Object.keys(statsMap).map(key => ({
            name: key,
            value: statsMap[key]
        }));

        const projectProgress = projects.map(project => {
            if (!project) return null;
            const p = project.get ? project.get({ plain: true }) : project;
            const tasksList = p.tasks || p.Tasks || [];
            const totalTasks = tasksList.length;
            const completedTasks = tasksList.filter(t => t && t.status === 'Done').length;
            const progressValue = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return {
                name: p.name,
                progress: progressValue,
                total: totalTasks,
                completed: completedTasks
            };
        }).filter(Boolean);

        const summary = {
            totalProjects: projects.length || 0,
            totalTasks: tasks.length || 0,
            completedTasks: tasks.filter(t => t && t.status === 'Done').length || 0,
            overdueTasks: tasks.filter(t => t && t.status !== 'Done' && (t.status === 'Overdue' || (t.dueDate && new Date(t.dueDate) < now))).length || 0
        };

        const resultData = {
            statusDistribution,
            projectProgress,
            summary,
            role: userRole
        };

        statsService.setCachedStats(cacheKey, resultData);

        res.status(200).json({
            message: 'İstatistikler başarıyla getirildi.',
            data: resultData
        });

    } catch (error) {
        console.error('[Stats Controller] ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};
