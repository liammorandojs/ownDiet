require('dotenv').config();
const express = require('express');
const cors = require('cors');
const calculateRoutes = require('./routes/calculate');
const authRoutes = require('./routes/auth');
const suggestRoutes = require('./routes/suggest');
const savedRoutes = require('./routes/saved');
const foods = require('./data/foods.json');
const { connectDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', calculateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', suggestRoutes);
app.use('/api/saved', savedRoutes);

app.get('/api/foods', (req, res) => {
    res.json({ success: true, data: foods });
});

app.get('/', (req, res) => {
    res.json({ message: 'myOwnDiet API is running' });
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
