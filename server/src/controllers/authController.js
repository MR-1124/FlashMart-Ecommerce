// ============================================================
// src/controllers/authController.js
// ============================================================

const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: result,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  res.json({
    success: true,
    message: 'Login successful.',
    data: result,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);

  res.json({
    success: true,
    data: { user },
  });
});

module.exports = { register, login, getMe };
