import api from './api';

const getMyTasks = async () => {
    const response = await api.get('/tasks/my');
    return response.data.data;
};

const getAllTasks = async (search = '') => {
    const response = await api.get(`/tasks/all?search=${search}`);
    return response.data.data;
};

const updateTaskStatus = async (taskId, status) => {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data.data;
};

const updateTask = async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data.data;
};

const deleteTask = async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data.data;
};

const createTask = async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data.data;
};

const taskService = {
    getMyTasks,
    getAllTasks,
    updateTaskStatus,
    updateTask,
    deleteTask,
    createTask,
};

export default taskService;
