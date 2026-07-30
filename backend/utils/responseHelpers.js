// backend/utils/responseHelpers.js

/**
 * Standard success response format
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @returns {Object} Formatted response
 */
export const successResponse = (data, message = null) => {
    return {
        success: true,
        ...(message && { message }),
        data,
        timestamp: new Date().toISOString()
    };
};

/**
 * Paginated response format
 * @param {Array} data - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {Object} additionalMeta - Additional metadata (optional)
 * @returns {Object} Formatted paginated response
 */
export const paginatedResponse = (data, page, limit, total, additionalMeta = {}) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage,
            hasPrevPage,
            ...additionalMeta
        },
        timestamp: new Date().toISOString()
    };
};

/**
 * Created resource response
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 * @returns {Object} Formatted response with 201 status indicator
 */
export const createdResponse = (data, message = 'Resource created successfully') => {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
};

/**
 * No content response helper
 * @param {string} message - Optional message
 * @returns {Object} Formatted response for 204-style operations
 */
export const noContentResponse = (message = 'Operation completed successfully') => {
    return {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };
};
