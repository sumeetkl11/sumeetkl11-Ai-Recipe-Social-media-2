// backend/utils/pagination.js

/**
 * Parse and validate pagination parameters from request
 * @param {Object} query - Express req.query object
 * @param {Object} options - Default values and constraints
 * @returns {Object} Validated pagination parameters
 */
export const parsePagination = (query, options = {}) => {
    const {
        defaultPage = 1,
        defaultLimit = 10,
        maxLimit = 100,
        minLimit = 1
    } = options;

    let page = parseInt(query.page) || defaultPage;
    let limit = parseInt(query.limit) || defaultLimit;

    // Validate and constrain values
    page = Math.max(1, page);
    limit = Math.max(minLimit, Math.min(maxLimit, limit));

    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

/**
 * Calculate pagination metadata
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export const calculatePagination = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, total);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        startIndex: total > 0 ? startIndex : 0,
        endIndex: total > 0 ? endIndex : 0
    };
};

/**
 * Generate pagination links for API navigation
 * @param {string} baseUrl - Base URL for the resource
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalPages - Total number of pages
 * @returns {Object} Pagination links
 */
export const generatePaginationLinks = (baseUrl, page, limit, totalPages) => {
    const links = {};

    // Self link
    links.self = `${baseUrl}?page=${page}&limit=${limit}`;

    // First page link
    links.first = `${baseUrl}?page=1&limit=${limit}`;

    // Last page link
    links.last = `${baseUrl}?page=${totalPages}&limit=${limit}`;

    // Previous page link
    if (page > 1) {
        links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
    }

    // Next page link
    if (page < totalPages) {
        links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
    }

    return links;
};

/**
 * Helper to build SQL LIMIT and OFFSET clause
 * @param {number} limit - Items per page
 * @param {number} offset - Offset value
 * @returns {string} SQL LIMIT/OFFSET clause
 */
export const buildLimitOffset = (limit, offset) => {
    return `LIMIT ${limit} OFFSET ${offset}`;
};
