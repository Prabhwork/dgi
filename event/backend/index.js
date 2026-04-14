require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Routes
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to Shared MongoDB (dgi) via .env'))
    .catch(err => console.error('DB Connection Error:', err));

// Mount Routes
app.use('/api/event', eventRoutes);

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Event Backend API is active', status: 'MVC structure initialized' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.json({ message: 'Event Backend API is active and connected to Shared DB' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
