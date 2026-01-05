module.exports = (sequelize, Sequelize) => {
    const ProjectMember = sequelize.define('project_member', {
        role: {
            type: Sequelize.ENUM('Member', 'Viewer'),
            defaultValue: 'Member'
        }
    });

    return ProjectMember;
};
