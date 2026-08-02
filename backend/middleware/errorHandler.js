// backend/middleware/errorHandler.js
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Global error handler middleware
 * Catches all errors and formats them consistently
 */
export const errorHandler = (err, req, res, next) => {
    // Enhanced logging for database errors
    const errorContext = {
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        // PostgreSQL error details
        pgCode: err.code,
        pgDetail: err.detail,
        pgHint: err.hint,
        pgTable: err.table,
        pgColumn: err.column,
        pgConstraint: err.constraint,
        // Original error name and type
        errorName: err.name,
        errorType: err.constructor?.name,
    };
    
    logger.error(err.message ?? 'Unhandled error', errorContext);

    // Handle ApiError instances
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(err.toJSON());
    }

    // Handle express-validator errors (from validation middleware)
    if (err.errors && Array.isArray(err.errors)) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                statusCode: 400,
                details: err.errors,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Invalid token',
                statusCode: 401,
                timestamp: new Date().toISOString()
            }
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Token expired',
                statusCode: 401,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Handle database errors
    if (err.code === '23505') { // Postgres unique violation
        return res.status(409).json({
            success: false,
            error: {
                message: 'Resource already exists',
                statusCode: 409,
                timestamp: new Date().toISOString()
            }
        });
    }

    if (err.code === '23503') { // Postgres foreign key violation
        return res.status(400).json({
            success: false,
            error: {
                message: 'Invalid reference',
                statusCode: 400,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Handle missing table/column errors
    if (err.code === '42P01') { // Postgres undefined_table
        logger.error('Database table does not exist', { table: err.table, query: err.query });
        return res.status(500).json({
            success: false,
            error: {
                message: process.env.NODE_ENV === 'development' 
                    ? `Database table does not exist: ${err.message}` 
                    : 'Database configuration error',
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        });
    }

    if (err.code === '42703') { // Postgres undefined_column
        logger.error('Database column does not exist', { column: err.column, table: err.table });
        return res.status(500).json({
            success: false,
            error: {
                message: process.env.NODE_ENV === 'development' 
                    ? `Database column does not exist: ${err.message}` 
                    : 'Database configuration error',
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Handle database connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        logger.error('Database connection failed', { code: err.code, address: err.address, port: err.port });
        return res.status(503).json({
            success: false,
            error: {
                message: 'Database connection unavailable',
                statusCode: 503,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Handle multer errors (file upload)
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            error: {
                message: `File upload error: ${err.message}`,
                statusCode: 400,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Last-resort guard: map AI provider quota / 429 errors to 503
    if (err?.status === 429 || /quota|429/i.test(err?.message || '')) {
        return res.status(503).json({
            success: false,
            error: {
                message: 'AI service temporarily unavailable — please try again shortly.',
                statusCode: 503,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Handle AI service network/timeout errors
    if (err?.code === 'NETWORK_ERROR' || err?.code === 'TIMEOUT_ERROR') {
        return res.status(err.status || 503).json({
            success: false,
            error: {
                message: err.message,
                statusCode: err.status || 503,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Default to 500 internal server error
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
            timestamp: new Date().toISOString()
        }
    });
};

/**
 * 404 Not Found handler
 * Must be placed after all routes
 */
export const notFoundHandler = (req, res, next) => {
    const error = ApiError.notFound(`Route ${req.method} ${req.path} not found`);
    next(error);
};
