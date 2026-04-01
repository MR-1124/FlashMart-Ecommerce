// ============================================================
// src/controllers/categoryController.js
// ============================================================

const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const listCategories = asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM categories ORDER BY name');

  res.json({
    success: true,
    data: { categories: result.rows },
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const existing = await query('SELECT id FROM categories WHERE slug = $1', [slug]);
  if (existing.rows.length > 0) {
    throw ApiError.conflict('Category already exists.');
  }

  const result = await query(
    'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *',
    [name, slug]
  );

  res.status(201).json({
    success: true,
    message: 'Category created.',
    data: { category: result.rows[0] },
  });
});

module.exports = { listCategories, createCategory };
