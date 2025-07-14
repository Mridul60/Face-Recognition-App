const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware Setup
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded bodies

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});

// Static Files
app.use('/assets', express.static('assets'));

// Routes
app.use(require('./routes')); // Load all routes from routes/index.js

// 404 Handler
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// General Error Handler
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        message: error.message || 'Something went wrong. Please try again.'
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server started on port', PORT));
