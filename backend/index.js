//This app starts a Node.js server created using Express.js framework - the work is to listen for HTTP requests like POST/login, GET/users...
//import express and initialize an express app
const express = require('express');
const app = express();
const port = 3000;

//for cross-platform
const cors = require('cors');
app.use(cors());
// app.use(express.json());

app.use(express.json());

// import router file for auth (API Routes)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

//start the app or server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});