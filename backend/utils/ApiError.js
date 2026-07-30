// backend/utils/ApiError.js

/**
 * Custom API Error class for consistent error handling
 */
class ApiError extends Error {
    constructor(statusCode, message, errors = null, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }

    // Factory methods for common errors
    static badRequest(message = 'Bad Request', errors = null) {
        return new ApiError(400, message, errors);
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }

    static tooManyRequests(message = 'Too many requests') {
        return new ApiError(429, message);
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, message, null, false);
    }

    static validation(errors) {
        return new ApiError(400, 'Validation failed', errors);
    }

    // Convert to JSON response format
    toJSON() {
        return {
            success: false,
            error: {
                message: this.message,
                statusCode: this.statusCode,
                ...(this.errors && { details: this.errors }),
                timestamp: this.timestamp
            }
        };
    }
}

export default ApiError;
