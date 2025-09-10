const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Get the token without the "Bearer " prefix
    const token = req.header('Authorization');
    console.log('Token:', token); // Log the token for debugging

    // Check if the token exists
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Verify the token without the Bearer prefix
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, name: decoded.name }; // Ensure name is part of the token payload
        next();
    } catch (error) {
        console.error('Token verification error:', error); // Log the error for debugging
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authenticate;
