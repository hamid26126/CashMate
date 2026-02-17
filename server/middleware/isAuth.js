const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
  try {
    // Try to get token from Authorization header first (standard)
    let token = req.headers.authorization?.split(' ')[1];
    
    // Fallback: try to get token from query parameter (for SSE)
    if (!token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = isAuth;
