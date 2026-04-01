// ============================================================
// src/routes/flashSaleRoutes.js
// ============================================================

const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const flashSaleController = require('../controllers/flashSaleController');

const router = Router();

// Public
router.get('/active', flashSaleController.getActiveFlashSale);

// Admin routes
router.get('/', auth, adminAuth, flashSaleController.listFlashSales);

router.post(
  '/',
  auth,
  adminAuth,
  [
    body('title').trim().notEmpty().withMessage('Sale title is required.'),
    body('start_time').isISO8601().withMessage('Valid start time is required.'),
    body('end_time').isISO8601().withMessage('Valid end time is required.'),
  ],
  validate,
  flashSaleController.createFlashSale
);

router.put('/:id', auth, adminAuth, flashSaleController.updateFlashSale);
router.delete('/:id', auth, adminAuth, flashSaleController.deleteFlashSale);

module.exports = router;
