/**
 * ============================================
 * SalonFlow — Pagination Middleware
 * ============================================
 * Reusable pagination helper for list endpoints.
 * Supports page, limit, sort, and returns
 * standardized pagination metadata.
 *
 * Gap #6: Pagination on List Endpoints
 */

/**
 * Parse pagination params from query string.
 * Usage in controller: const { page, limit, skip, sort } = parsePagination(req.query);
 *
 * @param {object} query - req.query object
 * @param {object} defaults - { defaultLimit, maxLimit, defaultSort }
 * @returns {{ page: number, limit: number, skip: number, sort: object }}
 */
const parsePagination = (query, defaults = {}) => {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    defaultSort = '-createdAt',
  } = defaults;

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  // Parse sort: "-createdAt" → { createdAt: -1 }, "name" → { name: 1 }
  const sortParam = query.sort || defaultSort;
  const sort = {};
  sortParam.split(',').forEach((field) => {
    if (field.startsWith('-')) {
      sort[field.substring(1)] = -1;
    } else {
      sort[field] = 1;
    }
  });

  return { page, limit, skip, sort };
};

/**
 * Build pagination response metadata.
 * @param {number} total - Total document count
 * @param {number} page - Current page
 * @param {number} limit - Page size
 * @returns {object} Pagination metadata
 */
const buildPaginationMeta = (total, page, limit) => {
  const pages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1,
  };
};

module.exports = { parsePagination, buildPaginationMeta };
