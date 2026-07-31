import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../cache/redis.js';

/**
 * Rate limiting configuration for different endpoint types
 */

const redisStore = (prefix) =>
    redisClient
        ? new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix
          })
        : undefined;

// General API rate limit - 300 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    skipSuccessfulRequests: false,
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
