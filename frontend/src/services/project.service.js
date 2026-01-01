import api from './api';

const createProject = async (name, description, ownerId) => {
    const response = await api.post('/projects', { name, description, ownerId });
    return response.data;
};

const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
};

const projectService = {
    createProject,
    getProjects,
};

export default projectService;
