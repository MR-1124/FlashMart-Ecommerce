// ============================================================
// src/services/orderService.js — Order business logic
// ============================================================
// The checkout flow uses a DB transaction to ensure atomicity:
//   1. Validate cart items & stock
//   2. Create order + order_items
//   3. Decrement product stock
//   4. Increment total_sold
//   5. Clear the cart
// If any step fails, everything rolls back.
// ============================================================

const { query, getClient } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

/**
 * Create order from cart (checkout)
 */
const createOrder = async (userId, { shipping_address, phone }) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Get cart items with product info
    const cartResult = await client.query(
      `SELECT ci.id, ci.quantity, ci.product_id,
              p.name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      throw ApiError.badRequest('Cart is empty.');
    }

    // 2. Check stock for each item and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartResult.rows) {
      if (item.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for "${item.name}". Available: ${item.stock}`);
      }

      const subtotal = parseFloat((item.price * item.quantity).toFixed(2));
      totalAmount += subtotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal,
      });
    }

    totalAmount = parseFloat(totalAmount.toFixed(2));

    // 3. Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address, phone)
       VALUES ($1, $2, 'pending', $3, $4)
       RETURNING *`,
      [userId, totalAmount, shipping_address, phone]
    );
    const order = orderResult.rows[0];

    // 4. Create order items & update stock
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id, item.quantity, item.unit_price, item.subtotal]
      );

      // Decrement stock and increment total_sold
      await client.query(
        `UPDATE products SET stock = stock - $1, total_sold = total_sold + $1, updated_at = NOW()
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // 5. Clear the cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    return { order, items: orderItems };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Get user's order history
 */
const getUserOrders = async (userId, queryParams) => {
  const { page, limit, offset } = parsePagination(queryParams);

  const countResult = await query(
    'SELECT COUNT(*) FROM orders WHERE user_id = $1',
    [userId]
  );
  const totalCount = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT * FROM orders WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    orders: result.rows,
    pagination: buildPaginationMeta(totalCount, page, limit),
  };
};

/**
 * Get single order with items
 */
const getOrder = async (orderId, userId = null) => {
  let sql = `SELECT * FROM orders WHERE id = $1`;
  const params = [orderId];

  if (userId) {
    sql += ' AND user_id = $2';
    params.push(userId);
  }

  const orderResult = await query(sql, params);
  if (orderResult.rows.length === 0) {
    throw ApiError.notFound('Order not found.');
  }

  const itemsResult = await query(
    `SELECT oi.*, p.name AS product_name, p.image_url
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  return {
    ...orderResult.rows[0],
    items: itemsResult.rows,
  };
};

/**
 * Get all orders (admin)
 */
const getAllOrders = async (queryParams) => {
  const { page, limit, offset } = parsePagination(queryParams);
  const { status } = queryParams;

  let whereClause = '';
  const params = [];

  if (status) {
    whereClause = 'WHERE o.status = $1';
    params.push(status);
  }

  const countSql = `SELECT COUNT(*) FROM orders o ${whereClause}`;
  const countResult = await query(countSql, params);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  const dataSql = `
    SELECT o.*, u.name AS user_name, u.email AS user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  params.push(limit, offset);
  const dataResult = await query(dataSql, params);

  return {
    orders: dataResult.rows,
    pagination: buildPaginationMeta(totalCount, page, limit),
  };
};

/**
 * Update order status (admin)
 */
const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const result = await query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, orderId]
  );

  if (result.rows.length === 0) {
    throw ApiError.notFound('Order not found.');
  }

  return result.rows[0];
};

module.exports = { createOrder, getUserOrders, getOrder, getAllOrders, updateOrderStatus };
