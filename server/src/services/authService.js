// ============================================================
// src/services/authService.js — Authentication business logic
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 12;

/**
 * Register a new user
 */
const register = async ({ name, email, password }) => {
  // Check if email already exists
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw ApiError.conflict('Email is already registered.');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insert user
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'user')
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash]
  );

  const user = result.rows[0];

  // Generate JWT
  const token = generateToken(user);

  return { user, token };
};

/**
 * Login with email and password
 */
const login = async ({ email, password }) => {
  // Find user
  const result = await query(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const user = result.rows[0];

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Generate JWT
  const token = generateToken(user);

  // Remove password from response
  const { password_hash, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

/**
 * Get current user profile by ID
 */
const getMe = async (userId) => {
  const result = await query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw ApiError.notFound('User not found.');
  }

  return result.rows[0];
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

module.exports = { register, login, getMe };
