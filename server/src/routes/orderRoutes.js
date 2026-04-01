// ============================================================
// src/routes/orderRoutes.js
// ============================================================

const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const orderController = require('../controllers/orderController');

const router = Router();

// User routes (require auth)
router.post(
  '/',
  auth,
  [
    body('shipping_address').trim().notEmpty().withMessage('Shipping address is required.'),
    body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  ],
  validate,
  orderController.createOrder
);

router.get('/', auth, orderController.getUserOrders);
router.get('/:id', auth, orderController.getOrder);

// Admin routes
router.get('/admin/all', auth, adminAuth, orderController.getAllOrders);
router.put('/:id/status', auth, adminAuth, orderController.updateOrderStatus);

module.exports = router;
