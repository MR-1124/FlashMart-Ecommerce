// ============================================================
// src/controllers/productController.js
// ============================================================

const productService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');

const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);

  res.json({
    success: true,
    data: result,
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.params.id);

  res.json({
    success: true,
    data: { product },
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    data: { product },
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Product updated successfully.',
    data: { product },
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  res.json({
    success: true,
    message: 'Product deleted successfully.',
  });
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
