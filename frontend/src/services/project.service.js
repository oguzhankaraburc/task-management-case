import api from './api';

const createProject = async (name, description, ownerId, startDate, endDate) => {
    const response = await api.post('/projects', { name, description, ownerId, startDate, endDate });
    return response.data.data;
};

const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data.data;
};

const updateProject = async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
};

const deleteProject = async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
};

const addMember = async (projectId, userId, role = 'Member') => {
    const response = await api.post(`/projects/${projectId}/members`, { userId, role });
    return response.data;
};

const removeMember = async (projectId, userId) => {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
};

const projectService = {
    createProject,
    getProjects,
    updateProject,
    deleteProject,
    addMember,
    removeMember
};

export default projectService;
