import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../cache/redis.js';

/**
 * Rate limiting configuration for different endpoint types
 */

const redisStore = (prefix) =>
    redisClient
        ? new RedisStore({ client: redisClient, prefix })
        : undefined;

// General API rate limit - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore('rl:general:')
});

// Strict rate limit for auth endpoints - 5 requests per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore('rl:auth:')
});

// Write operations rate limit - 20 requests per minute
export const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many write requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore('rl:write:')
});

// Messaging rate limit - 30 messages per minute
export const messageLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { success: false, message: 'You are sending messages too quickly, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore('rl:message:')
});

// File upload rate limit - 10 uploads per hour
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Upload limit reached, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore('rl:upload:')
});
