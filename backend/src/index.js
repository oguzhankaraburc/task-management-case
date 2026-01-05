const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const http = require('http');
const socketService = require('./services/socket.service');

const app = express();
const server = http.createServer(app);

socketService.init(server);

const corsOptions = {
    origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const db = require('./models');

db.sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced.');
}).catch((err) => {
    console.log('Failed to sync db: ' + err.message);
});

require('./routes/auth.routes')(app);
require('./routes/project.routes')(app);
require('./routes/task.routes')(app);
require('./routes/notification.routes')(app);
require('./routes/stats.routes')(app);

app.get('/', (req, res) => {
    res.json({ message: 'Task Management API is active.' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
