import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
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

const userOrIpKeyGenerator = (req) => (req.user?.id ? `user:${req.user.id}` : ipKeyGenerator(req.ip));

// General API rate limit - 300 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    skipSuccessfulRequests: false,
    keyGenerator: userOrIpKeyGenerator,
    message: { success: false, message: 'Too many requests, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore('rl:general:')
});

// Dedicated rate limit for AI generation - 20 requests per hour
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    keyGenerator: userOrIpKeyGenerator,
    message: { success: false, message: 'AI generation limit reached, please try again in an hour' },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore('rl:ai:')
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
    keyGenerator: userOrIpKeyGenerator,
    message: { success: false, message: 'Too many write requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore('rl:write:')
});
