// ============================================================
// src/services/flashSaleService.js — Flash sale business logic
// ============================================================

const { query, getClient } = require('../config/db');
const ApiError = require('../utils/ApiError');

/**
 * Get the currently active flash sale (public)
 * Active = is_active = true AND current time is between start_time and end_time
 */
const getActiveFlashSale = async () => {
  const saleResult = await query(
    `SELECT * FROM flash_sales
     WHERE is_active = true AND start_time <= NOW() AND end_time >= NOW()
     ORDER BY start_time DESC
     LIMIT 1`
  );

  if (saleResult.rows.length === 0) {
    // Check for upcoming sales
    const upcomingResult = await query(
      `SELECT * FROM flash_sales
       WHERE is_active = true AND start_time > NOW()
       ORDER BY start_time ASC
       LIMIT 1`
    );

    if (upcomingResult.rows.length > 0) {
      const sale = upcomingResult.rows[0];
      return { sale, items: [], status: 'upcoming' };
    }

    return null;
  }

  const sale = saleResult.rows[0];

  // Get sale items with product details
  const itemsResult = await query(
    `SELECT fsi.*, p.name, p.description, p.price AS original_price,
            p.image_url, p.stock AS regular_stock,
            c.name AS category_name
     FROM flash_sale_items fsi
     JOIN products p ON fsi.product_id = p.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE fsi.flash_sale_id = $1`,
    [sale.id]
  );

  return { sale, items: itemsResult.rows, status: 'active' };
};

/**
 * List all flash sales (admin)
 */
const listFlashSales = async () => {
  const result = await query(
    `SELECT fs.*,
            COUNT(fsi.id) AS item_count,
            SUM(fsi.sold_count) AS total_sold
     FROM flash_sales fs
     LEFT JOIN flash_sale_items fsi ON fs.id = fsi.flash_sale_id
     GROUP BY fs.id
     ORDER BY fs.created_at DESC`
  );

  return result.rows;
};

/**
 * Create a flash sale (admin)
 */
const createFlashSale = async (data) => {
  const { title, description, start_time, end_time, items } = data;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const saleResult = await client.query(
      `INSERT INTO flash_sales (title, description, start_time, end_time, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [title, description, start_time, end_time]
    );
    const sale = saleResult.rows[0];

    // Insert sale items
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO flash_sale_items (flash_sale_id, product_id, sale_price, sale_stock)
           VALUES ($1, $2, $3, $4)`,
          [sale.id, item.product_id, item.sale_price, item.sale_stock]
        );
      }
    }

    await client.query('COMMIT');
    return sale;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Update a flash sale (admin)
 */
const updateFlashSale = async (id, data) => {
  const { title, description, start_time, end_time, is_active } = data;

  const result = await query(
    `UPDATE flash_sales
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         start_time = COALESCE($3, start_time),
         end_time = COALESCE($4, end_time),
         is_active = COALESCE($5, is_active)
     WHERE id = $6
     RETURNING *`,
    [title, description, start_time, end_time, is_active, id]
  );

  if (result.rows.length === 0) {
    throw ApiError.notFound('Flash sale not found.');
  }

  return result.rows[0];
};

/**
 * Delete a flash sale (admin)
 */
const deleteFlashSale = async (id) => {
  const result = await query('DELETE FROM flash_sales WHERE id = $1 RETURNING *', [id]);
  if (result.rows.length === 0) {
    throw ApiError.notFound('Flash sale not found.');
  }
};

/**
 * Purchase a flash sale item (called during checkout)
 * Increments sold_count and checks sale_stock limit
 */
const purchaseFlashSaleItem = async (client, productId, quantity) => {
  // Check if product is in an active flash sale
  const saleItem = await client.query(
    `SELECT fsi.* FROM flash_sale_items fsi
     JOIN flash_sales fs ON fsi.flash_sale_id = fs.id
     WHERE fsi.product_id = $1
       AND fs.is_active = true
       AND fs.start_time <= NOW()
       AND fs.end_time >= NOW()
     LIMIT 1`,
    [productId]
  );

  if (saleItem.rows.length === 0) return null;

  const item = saleItem.rows[0];
  const remaining = item.sale_stock - item.sold_count;

  if (remaining < quantity) {
    throw ApiError.badRequest(`Flash sale stock exceeded. Only ${remaining} left at sale price.`);
  }

  await client.query(
    'UPDATE flash_sale_items SET sold_count = sold_count + $1 WHERE id = $2',
    [quantity, item.id]
  );

  return item;
};

module.exports = {
  getActiveFlashSale,
  listFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  purchaseFlashSaleItem,
};
