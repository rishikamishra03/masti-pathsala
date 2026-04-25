const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const verifyTeacher = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied: Teachers only' });
        }
        next();
    });
};

module.exports = { verifyToken, verifyTeacher };
