// ============================================================
// src/services/productService.js — Product business logic
// ============================================================

const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

/**
 * List products with search, filter, sort, and pagination
 */
const listProducts = async (queryParams) => {
  const { page, limit, offset } = parsePagination(queryParams);
  const { search, category, minPrice, maxPrice, sort } = queryParams;

  let whereClause = 'WHERE p.is_active = true';
  const params = [];
  let paramIndex = 1;

  // Search by name
  if (search) {
    whereClause += ` AND p.name ILIKE $${paramIndex}`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Filter by category (slug or id)
  if (category) {
    whereClause += ` AND c.slug = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  // Filter by price range
  if (minPrice) {
    whereClause += ` AND p.price >= $${paramIndex}`;
    params.push(parseFloat(minPrice));
    paramIndex++;
  }
  if (maxPrice) {
    whereClause += ` AND p.price <= $${paramIndex}`;
    params.push(parseFloat(maxPrice));
    paramIndex++;
  }

  // Sort
  let orderClause = 'ORDER BY p.created_at DESC'; // default: newest first
  if (sort === 'price_asc') orderClause = 'ORDER BY p.price ASC';
  else if (sort === 'price_desc') orderClause = 'ORDER BY p.price DESC';
  else if (sort === 'popularity') orderClause = 'ORDER BY p.total_sold DESC';
  else if (sort === 'rating') orderClause = 'ORDER BY p.avg_rating DESC';

  // Count total
  const countSql = `
    SELECT COUNT(*) FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
  `;
  const countResult = await query(countSql, params);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  // Fetch products
  const dataSql = `
    SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url,
           p.avg_rating, p.total_sold, p.is_active, p.created_at,
           c.id AS category_id, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ${orderClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);
  const dataResult = await query(dataSql, params);

  return {
    products: dataResult.rows,
    pagination: buildPaginationMeta(totalCount, page, limit),
  };
};

/**
 * Get a single product by ID
 */
const getProduct = async (id) => {
  const result = await query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw ApiError.notFound('Product not found.');
  }

  return result.rows[0];
};

/**
 * Create a new product (admin)
 */
const createProduct = async (data) => {
  const { name, description, price, stock, image_url, category_id } = data;

  const result = await query(
    `INSERT INTO products (name, description, price, stock, image_url, category_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, description, price, stock || 0, image_url || null, category_id || null]
  );

  return result.rows[0];
};

/**
 * Update a product (admin)
 */
const updateProduct = async (id, data) => {
  const existing = await getProduct(id);

  const { name, description, price, stock, image_url, category_id, is_active } = data;

  const result = await query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, stock = $4,
         image_url = $5, category_id = $6, is_active = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      name || existing.name,
      description !== undefined ? description : existing.description,
      price !== undefined ? price : existing.price,
      stock !== undefined ? stock : existing.stock,
      image_url !== undefined ? image_url : existing.image_url,
      category_id !== undefined ? category_id : existing.category_id,
      is_active !== undefined ? is_active : existing.is_active,
      id,
    ]
  );

  return result.rows[0];
};

/**
 * Delete a product (admin) — soft delete by setting is_active = false
 */
const deleteProduct = async (id) => {
  await getProduct(id); // throws if not found

  await query(
    'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1',
    [id]
  );
};

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
