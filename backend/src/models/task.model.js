module.exports = (sequelize, Sequelize) => {
    const Task = sequelize.define('task', {
        title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
        },
        status: {
            type: Sequelize.ENUM('Todo', 'In Progress', 'Done', 'Overdue'),
            defaultValue: 'Todo',
            validate: {
                isIn: [['Todo', 'In Progress', 'Done', 'Overdue']]
            }
        },
        priority: {
            type: Sequelize.ENUM('Low', 'Medium', 'High'),
            defaultValue: 'Medium',
            validate: {
                isIn: [['Low', 'Medium', 'High']]
            }
        },
        startDate: {
            type: Sequelize.DATE,
        },
        dueDate: {
            type: Sequelize.DATE,
        },
        creatorId: {
            type: Sequelize.INTEGER,
            allowNull: true
        }
    });

    return Task;
};
