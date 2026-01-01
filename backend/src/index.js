const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./models');

db.sequelize.sync().then(() => {
    console.log('Database synced.');
}).catch((err) => {
    console.log('Failed to sync db: ' + err.message);
});

require('./routes/auth.routes')(app);
require('./routes/project.routes')(app);
require('./routes/task.routes')(app);

const { verifyToken, isAdmin } = require('./middlewares/auth.middleware');
app.get('/api/admin-dashboard', [verifyToken, isAdmin], (req, res) => {
    res.status(200).send({ message: 'Welcome Admin!' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Task Management API.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
