import api from './api';

const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

const register = async (username, email, password, role) => {
    const response = await api.post('/auth/register', { username, email, password, role });
    return response.data;
};

const getUsers = async () => {
    const response = await api.get('/auth/users');
    return response.data;
};

const createUser = async (username, email, password, role) => {
    const response = await api.post('/auth/users', { username, email, password, role });
    return response.data;
};

const authService = {
    login,
    register,
    getUsers,
    createUser,
};

export default authService;
