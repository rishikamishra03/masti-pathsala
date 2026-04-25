const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Signup
router.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role || 'student']
        );

        const token = jwt.sign(
            { id: result.insertId, username, email, role: role || 'student' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        res.status(201).json({ token, user: { id: result.insertId, username, email, role: role || 'student' } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
