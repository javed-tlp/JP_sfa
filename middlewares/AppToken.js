// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'S3cure@JWTSecret#2024'; // Your JWT secret (store in environment variables in production)

// Middleware to verify the token
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; // Get the token directly from the Authorization header

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized! Invalid token.' });
        }
        req.userId = decoded.userId; // Save the userId from token payload for later use
        next();
    });
};
