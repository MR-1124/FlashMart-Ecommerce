// ============================================================
// src/middleware/validate.js — Request validation middleware
// ============================================================
// Works with express-validator. Run validation chains, then
// this middleware checks for errors and returns them.
// Usage: router.post('/route', [...validationRules], validate, controller)
// ============================================================

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    throw ApiError.badRequest('Validation failed', extractedErrors);
  }
  next();
};

module.exports = validate;
