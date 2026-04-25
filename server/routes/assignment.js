const express = require('express');
const router = express.Router();
const db = require('../db');

// Get assignments for a specific student
router.get('/student/:id', async (req, res) => {
    try {
        const [assignments] = await db.execute(`
            SELECT a.*, asub.status, asub.submission_text, asub.completed_at
            FROM assignments a
            JOIN assignment_submissions asub ON a.id = asub.assignment_id
            WHERE asub.student_id = ?
            ORDER BY a.created_at DESC
        `, [req.params.id]);
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Submit/Update an assignment
router.put('/submit', async (req, res) => {
    const { assignment_id, student_id, submission_text } = req.body;
    try {
        await db.execute(`
            UPDATE assignment_submissions 
            SET status = 'completed', submission_text = ?, completed_at = CURRENT_TIMESTAMP
            WHERE assignment_id = ? AND student_id = ?
        `, [submission_text, assignment_id, student_id]);
        res.json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
