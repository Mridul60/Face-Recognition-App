//This app starts a Node.js server created using Express.js framework
// the work is to listen for HTTP requests like POST/login, GET/users...

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
