import api from './api';

const getMyTasks = async () => {
    const response = await api.get('/tasks/my');
    return response.data;
};

const getAllTasks = async () => {
    const response = await api.get('/tasks/all');
    return response.data;
};

const updateTaskStatus = async (taskId, status) => {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
};

const deleteTask = async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
};

const createTask = async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
};

const taskService = {
    getMyTasks,
    getAllTasks,
    updateTaskStatus,
    deleteTask,
    createTask,
};

export default taskService;
