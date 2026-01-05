module.exports = (sequelize, Sequelize) => {
    const Project = sequelize.define('project', {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
        },
        startDate: {
            type: Sequelize.DATE,
        },
        endDate: {
            type: Sequelize.DATE,
        },
    });

    return Project;
};
