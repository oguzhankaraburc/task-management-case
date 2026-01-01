const db = require('../models');
const Task = db.Task;
const Project = db.Project;
const User = db.User;

exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, projectId, assignedUserId } = req.body;

        if (!title) {
            return res.status(400).send({ message: 'Görev başlığı zorunludur.' });
        }

        const project = await Project.findByPk(projectId);
        if (!project) return res.status(404).send({ message: 'Project not found' });

        if (req.userRole !== 'Admin' && project.ownerId !== req.userId) {
            return res.status(403).send({ message: 'No access to this project' });
        }

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            projectId,
            assignedUserId
        });
        res.status(201).send(task);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { assignedUserId: req.userId },
            include: [
                { model: Project, attributes: ['name'] },
                { model: User, as: 'assignedUser', attributes: ['username'] }
            ]
        });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: req.userRole === 'Admin' ? {} : { assignedUserId: req.userId },
            include: [
                { model: Project, attributes: ['name'] },
                { model: User, as: 'assignedUser', attributes: ['username'] }
            ]
        });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const task = await Task.findByPk(id);
        if (!task) return res.status(404).send({ message: 'Task not found' });

        if (req.userRole !== 'Admin' && task.assignedUserId !== req.userId) {
            return res.status(403).send({ message: 'Access denied' });
        }

        task.status = status;
        await task.save();

        res.status(200).send(task);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByPk(id);

        if (!task) return res.status(404).send({ message: 'Task not found' });

        if (req.userRole !== 'Admin' && task.assignedUserId !== req.userId) {
            return res.status(403).send({ message: 'Access denied' });
        }

        await task.destroy();
        res.status(200).send({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
