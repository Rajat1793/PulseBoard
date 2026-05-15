const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — requires a valid JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'loginAttempts', 'lockUntil'] },
    });
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized — user not found' });
    }
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized — invalid token' });
  }
};

/**
 * optionalAuth — attaches req.user if a valid token is present, does not fail otherwise
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password', 'loginAttempts', 'lockUntil'] },
      });
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

module.exports = { protect, optionalAuth };
