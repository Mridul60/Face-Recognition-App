const express = require('express');
const router = express.Router();
const db = require('../db');

// Register route
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(query, [name, email, password], (err, result) => {
        if (err) {
            console.error('MySQL Error:', err);
            return res.status(500).json({ error: 'Database error.' });
        }
        return res.status(200).json({ message: 'User registered successfully.' });
    });
});

module.exports = router;
