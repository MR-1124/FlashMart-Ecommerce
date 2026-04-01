// ============================================================
// src/middleware/auth.js — JWT authentication middleware
// ============================================================
// Extracts the JWT from the Authorization header, verifies it,
// and attaches the decoded user to req.user.
// Used on any route that requires a logged-in user.
// ============================================================

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const auth = (req, res, next) => {
  // Get token from header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token.');
  }
};

module.exports = auth;
