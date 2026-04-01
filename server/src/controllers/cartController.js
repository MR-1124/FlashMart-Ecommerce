// ============================================================
// src/controllers/cartController.js
// ============================================================

const cartService = require('../services/cartService');
const asyncHandler = require('../utils/asyncHandler');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);

  res.json({
    success: true,
    data: cart,
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity } = req.body;
  const item = await cartService.addToCart(req.user.id, product_id, quantity || 1);

  res.status(201).json({
    success: true,
    message: 'Item added to cart.',
    data: { item },
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const item = await cartService.updateCartItem(req.user.id, req.params.id, quantity);

  res.json({
    success: true,
    message: 'Cart updated.',
    data: { item },
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  await cartService.removeCartItem(req.user.id, req.params.id);

  res.json({
    success: true,
    message: 'Item removed from cart.',
  });
});

const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user.id);

  res.json({
    success: true,
    message: 'Cart cleared.',
  });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
