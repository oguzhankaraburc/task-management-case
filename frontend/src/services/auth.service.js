import api from './api';

const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
};

const getAllUsers = async (search = '', role = '') => {
    const response = await api.get(`/auth/users?search=${search}&role=${role}`);
    return response.data.data;
};

const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
};

const updateUser = async (id, userData) => {
    const response = await api.put(`/auth/users/${id}`, userData);
    return response.data.data;
};

const deleteUser = async (id) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
};

const updateProfile = async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
};

const uploadAvatar = async (formData) => {
    const response = await api.post('/auth/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data.data;
};

const authService = {
    login,
    register,
    createUser: register,
    getAllUsers,
    updateUser,
    deleteUser,
    updateProfile,
    uploadAvatar
};

export default authService;
