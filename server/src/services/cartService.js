// ============================================================
// src/services/cartService.js — Cart business logic
// ============================================================

const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');

/**
 * Get all cart items for a user
 */
const getCart = async (userId) => {
  const result = await query(
    `SELECT ci.id, ci.quantity, ci.created_at,
            p.id AS product_id, p.name, p.price, p.stock, p.image_url,
            c.name AS category_name
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at DESC`,
    [userId]
  );

  // Calculate totals
  const items = result.rows;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items,
    totalItems,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
  };
};

/**
 * Add an item to cart (or increment quantity if already present)
 */
const addToCart = async (userId, productId, quantity = 1) => {
  // Check product exists and has stock
  const product = await query('SELECT id, stock, is_active FROM products WHERE id = $1', [productId]);
  if (product.rows.length === 0 || !product.rows[0].is_active) {
    throw ApiError.notFound('Product not found.');
  }
  if (product.rows[0].stock < quantity) {
    throw ApiError.badRequest('Insufficient stock.');
  }

  // Upsert: insert or update quantity
  const result = await query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()
     RETURNING *`,
    [userId, productId, quantity]
  );

  return result.rows[0];
};

/**
 * Update cart item quantity
 */
const updateCartItem = async (userId, cartItemId, quantity) => {
  // Verify ownership
  const item = await query(
    'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = $1 AND ci.user_id = $2',
    [cartItemId, userId]
  );

  if (item.rows.length === 0) {
    throw ApiError.notFound('Cart item not found.');
  }

  if (quantity > item.rows[0].stock) {
    throw ApiError.badRequest('Insufficient stock.');
  }

  const result = await query(
    'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [quantity, cartItemId]
  );

  return result.rows[0];
};

/**
 * Remove an item from cart
 */
const removeCartItem = async (userId, cartItemId) => {
  const result = await query(
    'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
    [cartItemId, userId]
  );

  if (result.rows.length === 0) {
    throw ApiError.notFound('Cart item not found.');
  }
};

/**
 * Clear entire cart for a user
 */
const clearCart = async (userId) => {
  await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
