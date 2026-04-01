// ============================================================
// src/middleware/errorHandler.js — Global error handler
// ============================================================
// Express calls this when next(err) is invoked or an error
// is thrown. It sends a clean JSON error response.
// In development, it includes the stack trace for debugging.
// ============================================================

const config = require('../config/env');

const errorHandler = (err, req, res, _next) => {
  // Default to 500 if statusCode isn't set
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error (in production, send to CloudWatch/logging service)
  console.error(`❌ [${req.method}] ${req.originalUrl} → ${statusCode}: ${message}`);
  if (config.nodeEnv === 'development' && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
