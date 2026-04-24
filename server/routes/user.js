const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// Middleware to protect routes
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get User Profile (Progress + Avatar + Total Points)
router.get('/profile', auth, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT username AS name, email FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        const dbUser = users[0];

        const [avatar] = await db.execute('SELECT * FROM user_avatars WHERE user_id = ?', [req.user.id]);
        
        // Fetch progress for all modules
        const [progress] = await db.execute(`
            SELECT m.id, m.title, p.completed, p.score 
            FROM learning_modules m
            LEFT JOIN user_progress p ON m.id = p.module_id AND p.user_id = ?
        `, [req.user.id]);

        const [totalPoints] = await db.execute('SELECT SUM(score) as points FROM user_progress WHERE user_id = ?', [req.user.id]);
        
        // Fetch detailed mastery
        const [mastery] = await db.execute(`
            SELECT module_id, COUNT(*) as mastered_count 
            FROM user_detailed_progress 
            WHERE user_id = ? AND mastered = 1
            GROUP BY module_id
        `, [req.user.id]);
        
        // Fetch user badges
        const [userBadges] = await db.execute(`
            SELECT b.*, ub.earned_at 
            FROM badges b
            JOIN user_badges ub ON b.id = ub.badge_id
            WHERE ub.user_id = ?
        `, [req.user.id]);
        
        res.json({
            username: dbUser.name,
            displayName: dbUser.name,
            email: dbUser.email,
            avatar: avatar.length > 0 ? avatar[0] : null,
            progress: progress,
            totalPoints: totalPoints[0].points || 0,
            mastery: mastery,
            badges: userBadges
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Save/Update Avatar
router.post('/avatar', auth, async (req, res) => {
    const { 
        skinColor, hairColor, hairStyle, eyeColor, eyeStyle, 
        mouthStyle, topStyle, topColor, bottomStyle, bottomColor, 
        shoesStyle, shoesColor, accessory, companion, bgColor 
    } = req.body;

    try {
        await db.execute(
            `INSERT INTO user_avatars 
            (user_id, skinColor, hairColor, hairStyle, eyeColor, eyeStyle, mouthStyle, topStyle, topColor, bottomStyle, bottomColor, shoesStyle, shoesColor, accessory, companion, bgColor) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            skinColor=?, hairColor=?, hairStyle=?, eyeColor=?, eyeStyle=?, mouthStyle=?, topStyle=?, topColor=?, bottomStyle=?, bottomColor=?, shoesStyle=?, shoesColor=?, accessory=?, companion=?, bgColor=?`,
            [
                req.user.id, skinColor, hairColor, hairStyle, eyeColor, eyeStyle, mouthStyle, topStyle, topColor, bottomStyle, bottomColor, shoesStyle, shoesColor, accessory, companion, bgColor,
                skinColor, hairColor, hairStyle, eyeColor, eyeStyle, mouthStyle, topStyle, topColor, bottomStyle, bottomColor, shoesStyle, shoesColor, accessory, companion, bgColor
            ]
        );
        res.json({ message: 'Avatar updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update Progress and Score
router.post('/progress', auth, async (req, res) => {
    const { module_id, completed, score } = req.body;
    try {
        await db.execute(
            `INSERT INTO user_progress (user_id, module_id, completed, score, times_played) 
             VALUES (?, ?, ?, ?, 1) 
             ON DUPLICATE KEY UPDATE 
             completed = VALUES(completed), 
             score = GREATEST(score, VALUES(score)),
             times_played = times_played + 1`,
            [req.user.id, module_id, completed, score || 0]
        );

        // --- AUTOMATIC REWARDS LOGIC ---
        // 1. Check for 'First Win' badge
        const [totalGames] = await db.execute('SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND completed = 1', [req.user.id]);
        if (totalGames[0].count >= 1) {
            await db.execute('INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)', [req.user.id, 'first_win']);
        }

        // 2. Check for 'Centurion' badge (Score >= 100)
        if (score >= 100) {
            await db.execute('INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)', [req.user.id, 'score_100']);
        }

        // 3. Check for module-specific badges
        if (module_id === 'math' && completed) {
             await db.execute('INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)', [req.user.id, 'math_master']);
        }
        if (module_id === 'alphabets' && completed) {
             await db.execute('INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)', [req.user.id, 'alphabet_hero']);
        }

        res.json({ message: 'Progress updated and rewards checked' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update Detailed Progress (Mastery)
router.post('/mastery', auth, async (req, res) => {
    const { module_id, content_id, mastered } = req.body;
    try {
        await db.execute(
            `INSERT INTO user_detailed_progress (user_id, module_id, content_id, mastered, attempts) 
             VALUES (?, ?, ?, ?, 1) 
             ON DUPLICATE KEY UPDATE 
             mastered = VALUES(mastered),
             attempts = attempts + 1`,
            [req.user.id, module_id, content_id, mastered]
        );
        res.json({ message: 'Mastery updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Global Leaderboard
router.get('/leaderboard', auth, async (req, res) => {
    try {
        const [leaders] = await db.execute(`
            SELECT u.username, SUM(p.score) as total_points
            FROM users u
            JOIN user_progress p ON u.id = p.user_id
            GROUP BY u.id
            ORDER BY total_points DESC
            LIMIT 10
        `);
        res.json(leaders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Module Content
router.get('/modules/:moduleId', auth, async (req, res) => {
    try {
        const [content] = await db.execute(
            'SELECT * FROM module_content WHERE module_id = ?',
            [req.params.moduleId]
        );
        const [questions] = await db.execute(
            'SELECT * FROM quiz_questions WHERE module_id = ?',
            [req.params.moduleId]
        );
// --- PROFESSIONAL EXTENSIONS ---

// Update Account Settings (Username/Email)
router.put('/account', auth, async (req, res) => {
    const { username, email, newPassword } = req.body;
    try {
        // Check if username/email already taken by someone else
        const [existing] = await db.execute(
            'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, req.user.id]
        );
        if (existing.length > 0) return res.status(400).json({ message: 'Username or email already in use' });

        let query = 'UPDATE users SET username = ?, email = ?';
        let params = [username, email];

        if (newPassword) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(req.user.id);

        await db.execute(query, params);
        res.json({ message: 'Account updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get All Achievements (Locked + Unlocked)
router.get('/achievements', auth, async (req, res) => {
    try {
        const [allBadges] = await db.execute('SELECT * FROM badges');
        const [userBadges] = await db.execute('SELECT badge_id FROM user_badges WHERE user_id = ?', [req.user.id]);
        
        const earnedIds = userBadges.map(b => b.badge_id);
        const achievements = allBadges.map(badge => ({
            ...badge,
            locked: !earnedIds.includes(badge.id)
        }));

        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete Account (Privacy Policy Compliance)
router.delete('/account', auth, async (req, res) => {
    try {
        // Delete all related data first due to foreign keys (if not cascading)
        await db.execute('DELETE FROM user_progress WHERE user_id = ?', [req.user.id]);
        await db.execute('DELETE FROM user_avatars WHERE user_id = ?', [req.user.id]);
        await db.execute('DELETE FROM user_badges WHERE user_id = ?', [req.user.id]);
        await db.execute('DELETE FROM users WHERE id = ?', [req.user.id]);
        
        res.json({ message: 'Account and all data permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
        res.json({ content, questions });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
