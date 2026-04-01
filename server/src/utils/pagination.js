// ============================================================
// src/utils/pagination.js — Pagination helper
// ============================================================
// Extracts page/limit from query string, calculates offset,
// and returns a structured pagination response.
// ============================================================

/**
 * Parse pagination params from query string
 * @param {object} query - req.query
 * @returns {{ page: number, limit: number, offset: number }}
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Build pagination metadata for response
 * @param {number} totalCount - total rows from DB
 * @param {number} page - current page
 * @param {number} limit - items per page
 * @returns {object} pagination metadata
 */
const buildPaginationMeta = (totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    currentPage: page,
    totalPages,
    totalCount,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { parsePagination, buildPaginationMeta };
