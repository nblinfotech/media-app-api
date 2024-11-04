// app.js

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const path = require('path');
const {getUploadedFile} = require('./controllers/fileController')

const app = express();

const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL // Change this to your React app's URL
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/get/:fileId', getUploadedFile);


module.exports = app;
