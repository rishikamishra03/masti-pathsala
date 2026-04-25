const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const teacherRoutes = require('./routes/teacher');
const assignmentRoutes = require('./routes/assignment');

const app = express();

app.use(cors());
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

// Log raw body for debugging JSON errors
app.use((req, res, next) => {
    if (req.rawBody) console.log('DEBUG RAW BODY:', req.rawBody);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/assignments', assignmentRoutes);

app.get('/', (req, res) => {
    res.send('Masti Pathshala API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
