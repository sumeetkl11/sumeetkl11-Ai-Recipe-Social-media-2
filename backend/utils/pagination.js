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
