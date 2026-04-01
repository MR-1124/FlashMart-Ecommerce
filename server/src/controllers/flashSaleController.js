// ============================================================
// src/controllers/flashSaleController.js
// ============================================================

const flashSaleService = require('../services/flashSaleService');
const asyncHandler = require('../utils/asyncHandler');

const getActiveFlashSale = asyncHandler(async (req, res) => {
  const result = await flashSaleService.getActiveFlashSale();

  res.json({
    success: true,
    data: result,
  });
});

const listFlashSales = asyncHandler(async (req, res) => {
  const sales = await flashSaleService.listFlashSales();

  res.json({
    success: true,
    data: { sales },
  });
});

const createFlashSale = asyncHandler(async (req, res) => {
  const sale = await flashSaleService.createFlashSale(req.body);

  res.status(201).json({
    success: true,
    message: 'Flash sale created.',
    data: { sale },
  });
});

const updateFlashSale = asyncHandler(async (req, res) => {
  const sale = await flashSaleService.updateFlashSale(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Flash sale updated.',
    data: { sale },
  });
});

const deleteFlashSale = asyncHandler(async (req, res) => {
  await flashSaleService.deleteFlashSale(req.params.id);

  res.json({
    success: true,
    message: 'Flash sale deleted.',
  });
});

module.exports = { getActiveFlashSale, listFlashSales, createFlashSale, updateFlashSale, deleteFlashSale };
