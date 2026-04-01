// ============================================================
// src/routes/productRoutes.js
// ============================================================

const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const productController = require('../controllers/productController');

const router = Router();

// Public routes
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);

// Admin routes
router.post(
  '/',
  auth,
  adminAuth,
  [
    body('name').trim().notEmpty().withMessage('Product name is required.'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  ],
  validate,
  productController.createProduct
);

router.put(
  '/:id',
  auth,
  adminAuth,
  productController.updateProduct
);

router.delete('/:id', auth, adminAuth, productController.deleteProduct);

module.exports = router;
