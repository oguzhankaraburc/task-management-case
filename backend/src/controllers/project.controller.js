const db = require('../models');
const Project = db.Project;
const User = db.User;

exports.createProject = async (req, res) => {
    try {
        const { name, description, ownerId } = req.body;

        const finalOwnerId = req.userRole === 'Admin' && ownerId ? ownerId : req.userId;

        const project = await Project.create({
            name,
            description,
            ownerId: finalOwnerId
        });
        res.status(201).send(project);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            where: req.userRole === 'Admin' ? {} : { ownerId: req.userId },
            include: [{ model: User, as: 'owner', attributes: ['username', 'email'] }]
        });
        res.status(200).send(projects);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
