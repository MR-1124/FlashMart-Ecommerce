// ============================================================
// src/routes/cartRoutes.js
// ============================================================

const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const cartController = require('../controllers/cartController');

const router = Router();

// All cart routes require authentication
router.use(auth);

router.get('/', cartController.getCart);

router.post(
  '/',
  [
    body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required.'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  ],
  validate,
  cartController.addToCart
);

router.put(
  '/:id',
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.')],
  validate,
  cartController.updateCartItem
);

router.delete('/:id', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;
