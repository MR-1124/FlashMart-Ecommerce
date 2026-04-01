// ============================================================
// src/controllers/orderController.js
// ============================================================

const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandler');

const createOrder = asyncHandler(async (req, res) => {
  const { shipping_address, phone } = req.body;
  const result = await orderService.createOrder(req.user.id, { shipping_address, phone });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    data: result,
  });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user.id, req.query);

  res.json({
    success: true,
    data: result,
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(req.params.id, req.user.id);

  res.json({
    success: true,
    data: { order },
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);

  res.json({
    success: true,
    data: result,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);

  res.json({
    success: true,
    message: 'Order status updated.',
    data: { order },
  });
});

module.exports = { createOrder, getUserOrders, getOrder, getAllOrders, updateOrderStatus };
