import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../cache/redis.js';

/**
 * Rate limiting configuration for different endpoint types
 */

// General API rate limit - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis store if available, fallback to memory
    store: redisClient ? new RedisStore({
        client: redisClient,
        prefix: 'rl:general:'
    }) : undefined
});

// Strict rate limit for auth endpoints - 5 requests per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
        client: redisClient,
        prefix: 'rl:auth:'
    }) : undefined
});

// Write operations rate limit - 20 requests per minute
export const writeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: {
        success: false,
        message: 'Too many write requests, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
        client: redisClient,
        prefix: 'rl:write:'
    }) : undefined
});

// Messaging rate limit - 30 messages per minute
export const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        message: 'You are sending messages too quickly, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
        client: redisClient,
        prefix: 'rl:message:'
    }) : undefined
});

// File upload rate limit - 10 uploads per hour
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        message: 'Upload limit reached, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
        client: redisClient,
        prefix: 'rl:upload:'
    }) : undefined
});
