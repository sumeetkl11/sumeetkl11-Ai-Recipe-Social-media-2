import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation middleware to check for validation errors
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Auth validation rules
 */
export const registerValidation = [
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail()
        .trim(),
    body('name')
        .isString().withMessage('Name must be a string')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name contains invalid characters'),
    body('password')
        .isString()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
    validate
];

export const loginValidation = [
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail()
        .trim(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

/**
 * Post validation rules
 */
export const createPostValidation = [
    body('recipeId')
        .optional()
        .isUUID().withMessage('Recipe ID must be a valid UUID'),
    body('caption')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 2000 }).withMessage('Caption cannot exceed 2000 characters')
        .escape(), // Sanitize HTML
    body('imageUrl')
        .optional()
        .isURL().withMessage('Image URL must be valid'),
    validate
];

export const updatePostValidation = [
    param('id')
        .isUUID().withMessage('Post ID must be a valid UUID'),
    body('caption')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 2000 }).withMessage('Caption cannot exceed 2000 characters')
        .escape(),
    validate
];

/**
 * Comment validation rules
 */
export const createCommentValidation = [
    param('postId')
        .isUUID().withMessage('Post ID must be a valid UUID'),
    body('content')
        .isString().withMessage('Comment content is required')
        .trim()
        .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
        .escape(),
    validate
];

/**
 * Message validation rules
 */
export const createMessageValidation = [
    body('conversationId')
        .isUUID().withMessage('Conversation ID must be a valid UUID'),
    body('content')
        .isString().withMessage('Message content is required')
        .trim()
        .isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters')
        .escape(),
    validate
];

/**
 * Pagination validation
 */
export const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        .toInt(),
    validate
];

/**
 * UUID param validation
 */
export const uuidParamValidation = (paramName = 'id') => [
    param(paramName)
        .isUUID().withMessage(`${paramName} must be a valid UUID`),
    validate
];
