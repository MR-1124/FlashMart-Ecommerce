// ============================================================
// src/utils/asyncHandler.js — Async route wrapper
// ============================================================
// Wraps async route handlers so that rejected promises are
// automatically forwarded to Express's error handler.
// Without this, you'd need try/catch in every single route.
// ============================================================

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
