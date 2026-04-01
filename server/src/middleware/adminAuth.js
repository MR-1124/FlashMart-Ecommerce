// ============================================================
// src/middleware/adminAuth.js — Admin role check middleware
// ============================================================
// Must be used AFTER the auth middleware. Checks if the
// authenticated user has the 'admin' role.
// ============================================================

const ApiError = require('../utils/ApiError');

const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw ApiError.forbidden('Admin access required.');
  }
  next();
};

module.exports = adminAuth;
