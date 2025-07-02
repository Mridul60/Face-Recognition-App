const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const apiRoutes = require('./routes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api',apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const bodyParser = require('body-parser');
require('dotenv').config();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS setup
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use('/assets', express.static('assets'));
app.use(require('./routes'));

// Error handling
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    console.log(error);
    res.status(error.status || 500);
    if (!error.status) {
        error.message = 'Something went wrong. Please try again.'
    }
    return res.json({
        message: error.message
    });
});

app.listen(process.env.PORT, () => console.log('server started', process.env.PORT));




{/*
Client Request (e.g., POST /auth/login)
        ↓
app.js (Express Server Entry Point)
        ↓
routes/index.js (Router)
        ↓
loginHandler (from modules/auth/index.js)
        ↓
login.service.js (Handles DB call + logic)
        ↓
dbConfig.js (MySQL connection)
        ↓
Response sent using util/http.js → sendResponse()
*/}