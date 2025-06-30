const express = require('express');
const router = express.Router();
const db = require("../db");

//login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({message: "Email and password is required"});
    }

    const query = "select * from employee where email = ?";
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('MySQL error', err);
            return res.status(500).json({message: 'Database error'});
        }
        if (results.length === 0) {
            return res.status(404).json({message: 'User Not Found'});
        }
        const user = results[0];
        if(user.password !== password) {
            return res.status(401).json({message: 'Password is incorrect'});
        }
        return res.status(200).json({
            message: 'Successfully logged in!',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        })
    })
})

module.exports = router;
