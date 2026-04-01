// ============================================================
// src/routes/authRoutes.js
// ============================================================

const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters.'),
  ],
  validate,
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  authController.login
);

// GET /api/auth/me
router.get('/me', auth, authController.getMe);

module.exports = router;
