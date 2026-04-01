// ============================================================
// src/routes/categoryRoutes.js
// ============================================================

const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const categoryController = require('../controllers/categoryController');

const router = Router();

router.get('/', categoryController.listCategories);

router.post(
  '/',
  auth,
  adminAuth,
  [body('name').trim().notEmpty().withMessage('Category name is required.')],
  validate,
  categoryController.createCategory
);

module.exports = router;
