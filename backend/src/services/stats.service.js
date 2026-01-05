const socketService = require('./socket.service');

let statsCache = new Map();


const clearStatsCache = (userId = null) => {
    if (userId) {
        statsCache.delete(userId);
        statsCache.delete('Admin');
    } else {
        statsCache.clear();
    }

    const io = socketService.getIO();
    if (io) {
        io.emit('stats_update');
    }
};

const getCachedStats = (key) => {
    return statsCache.get(key);
};

const setCachedStats = (key, data) => {
    statsCache.set(key, {
        data,
        timestamp: Date.now()
    });
};

module.exports = {
    clearStatsCache,
    getCachedStats,
    setCachedStats
};
