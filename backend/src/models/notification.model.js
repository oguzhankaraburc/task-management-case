module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define('notification', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        type: {
            type: Sequelize.ENUM('PROJECT_ASSIGN', 'TASK_ASSIGN', 'TASK_OVERDUE', 'SYSTEM'),
            defaultValue: 'SYSTEM'
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        message: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        relatedId: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        isRead: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    });

    return Notification;
};
