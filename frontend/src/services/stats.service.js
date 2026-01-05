import api from './api';

const getStats = async () => {
    const response = await api.get('/stats');
    return response.data.data;
};

const statsService = {
    getStats
};

export default statsService;
