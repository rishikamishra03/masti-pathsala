const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyTeacher } = require('../middleware/auth');

// Get overview stats
router.get('/stats', verifyTeacher, async (req, res) => {
    try {
        const tId = req.user.id || 0;
        const [studentCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
        const [assignmentCount] = await db.query("SELECT COUNT(*) as count FROM assignments WHERE teacher_id = ?", [tId]);
        const [avgScore] = await db.query("SELECT AVG(score) as avg FROM user_progress");
        const [subsToday] = await db.query("SELECT COUNT(*) as count FROM assignment_submissions WHERE DATE(completed_at) = CURDATE()");

        res.json({
            totalStudents: studentCount[0].count,
            activeAssignments: assignmentCount[0].count,
            averagePoints: Math.round(avgScore[0].avg || 0),
            submissionsToday: subsToday[0].count
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Get recent activity (Module Plays + Assignment Submissions)
router.get('/activity', verifyTeacher, async (req, res) => {
    try {
        const [activity] = await db.query(`
            (SELECT 
                'module' as type, 
                u.username, 
                lm.title as module_title, 
                up.score, 
                up.last_played as activity_date
            FROM user_progress up
            JOIN users u ON up.user_id = u.id
            JOIN learning_modules lm ON up.module_id = lm.id)
            UNION ALL
            (SELECT 
                'assignment' as type, 
                u.username, 
                a.title as module_title, 
                100 as score,
                asub.completed_at as activity_date
            FROM assignment_submissions asub
            JOIN users u ON asub.student_id = u.id
            JOIN assignments a ON asub.assignment_id = a.id
            WHERE asub.status = 'completed')
            ORDER BY activity_date DESC
            LIMIT 15
        `);
        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Get all assignments
router.get('/assignments', verifyTeacher, async (req, res) => {
    try {
        const tId = req.user.id || 0;
        const [assignments] = await db.query('SELECT * FROM assignments WHERE teacher_id = ?', [tId]);
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Broadcast a "Magical Message" to all students
router.post('/broadcast', verifyTeacher, async (req, res) => {
    const { message } = req.body;
    try {
        const tId = req.user.id || 0;
        await db.query('INSERT INTO notifications (message, type, created_by) VALUES (?, ?, ?)', [message || '', 'magical', tId]);
        res.json({ message: 'Broadcast sent successfully' });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Get all students and their progress summary
router.get('/students', verifyTeacher, async (req, res) => {
    try {
        const [students] = await db.query(`
            SELECT u.id, u.username, u.email, 
                   COUNT(up.module_id) as modules_started,
                   SUM(up.completed) as modules_completed,
                   SUM(up.score) as total_score
            FROM users u
            LEFT JOIN user_progress up ON u.id = up.user_id
            WHERE u.role = 'student'
            GROUP BY u.id
        `);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Create an assignment
router.post('/assignments', verifyTeacher, async (req, res) => {
    try {
        const { title, description, category, due_date } = req.body;
        const teacherId = req.user.id || null;

        console.log('CREATING ASSIGNMENT - LOG:', { title, teacherId });

        // 1. Insert Assignment
        const [result] = await db.query(
            'INSERT INTO assignments (teacher_id, title, description, category, due_date) VALUES (?, ?, ?, ?, ?)',
            [teacherId, title || 'Untitled', description || '', category || 'Maths', due_date || null]
        );
        
        const assignmentId = result.insertId;

        // 2. Get all students
        const [students] = await db.query("SELECT id FROM users WHERE role = 'student'");
        
        // 3. Create submissions and notifications for each student
        for (const student of students) {
            try {
                // Pending submission
                await db.query(
                    'INSERT INTO assignment_submissions (assignment_id, student_id, status) VALUES (?, ?, ?)',
                    [assignmentId, student.id, 'pending']
                );
                
                // Student notification
                await db.query(
                    'INSERT INTO notifications (message, type, created_by) VALUES (?, ?, ?)',
                    [`New assignment created: ${title || 'New Task'}`, 'assignment', teacherId]
                );
            } catch (innerErr) {
                console.error('Student loop error:', innerErr.message);
            }
        }

        res.status(201).json({ id: assignmentId, message: 'Assignment created successfully' });
    } catch (error) {
        console.error('ROOT ASSIGNMENT ERROR:', error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Get submissions for a specific assignment
router.get('/assignments/:id/submissions', verifyTeacher, async (req, res) => {
    try {
        const [submissions] = await db.query(`
            SELECT asub.*, u.username as student_name
            FROM assignment_submissions asub
            JOIN users u ON asub.student_id = u.id
            WHERE asub.assignment_id = ?
        `, [req.params.id]);
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Get all notifications sent by this teacher
router.get('/notifications', verifyTeacher, async (req, res) => {
    try {
        const tId = req.user.id || 0;
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE created_by = ? ORDER BY created_at DESC LIMIT 50', 
            [tId]
        );
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Delete a notification
router.delete('/notifications/:id', verifyTeacher, async (req, res) => {
    try {
        const tId = req.user.id || 0;
        await db.query('DELETE FROM notifications WHERE id = ? AND created_by = ?', [req.params.id, tId]);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Delete an assignment
router.delete('/assignments/:id', verifyTeacher, async (req, res) => {
    try {
        const tId = req.user.id || 0;
        await db.query('DELETE FROM assignment_submissions WHERE assignment_id = ?', [req.params.id]);
        await db.query('DELETE FROM assignments WHERE id = ? AND teacher_id = ?', [req.params.id, tId]);
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

module.exports = router;
