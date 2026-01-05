const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false,
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user.model')(sequelize, Sequelize);
db.Project = require('./project.model')(sequelize, Sequelize);
db.Task = require('./task.model')(sequelize, Sequelize);
db.ProjectMember = require('./projectMember.model')(sequelize, Sequelize);
db.Notification = require('./notification.model')(sequelize, Sequelize);

db.User.hasMany(db.Project, { foreignKey: 'ownerId' });
db.Project.belongsTo(db.User, { as: 'owner', foreignKey: 'ownerId' });

db.User.belongsToMany(db.Project, { through: db.ProjectMember, as: 'MemberProjects', foreignKey: 'userId' });
db.Project.belongsToMany(db.User, { through: db.ProjectMember, as: 'members', foreignKey: 'projectId' });

db.Project.hasMany(db.Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
db.Task.belongsTo(db.Project, { foreignKey: 'projectId' });

db.User.hasMany(db.Task, { foreignKey: 'assignedUserId', onDelete: 'SET NULL' });
db.Task.belongsTo(db.User, { as: 'assignedUser', foreignKey: 'assignedUserId', onDelete: 'SET NULL' });

db.User.hasMany(db.Task, { foreignKey: 'creatorId', onDelete: 'SET NULL' });
db.Task.belongsTo(db.User, { as: 'creator', foreignKey: 'creatorId', onDelete: 'SET NULL' });

db.User.hasMany(db.Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Notification.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;
