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
            type: Sequelize.ENUM('Todo', 'In Progress', 'Done'),
            defaultValue: 'Todo',
            validate: {
                isIn: [['Todo', 'In Progress', 'Done']]
            }
        },
        priority: {
            type: Sequelize.ENUM('Low', 'Medium', 'High'),
            defaultValue: 'Medium',
            validate: {
                isIn: [['Low', 'Medium', 'High']]
            }
        },
    });

    return Task;
};
