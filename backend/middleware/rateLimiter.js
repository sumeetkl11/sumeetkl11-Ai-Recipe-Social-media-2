import rateLimit, { ipKeyGenerator, MemoryStore } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../cache/redis.js';

/**
 * Rate limiting configuration for different endpoint types
 */

/**
 * Use Redis when it is available, while keeping rate limiting functional when
 * Redis is unavailable in local development or during a Redis outage.
 */
class ResilientRateLimitStore {
    constructor(prefix) {
        this.prefix = prefix;
        this.memoryStore = new MemoryStore();
        this.redisStore = new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix
        });
        this.redisInitialized = false;
        this.fallbackLogged = false;
    }

    init(options) {
        this.memoryStore.init(options);
        if (redisClient?.isReady) {
            return this.initializeRedis(options);
        }
        this.logFallback();
    }

    async initializeRedis(options) {
        try {
            await this.redisStore.init(options);
            this.redisInitialized = true;
        } catch (error) {
            this.redisInitialized = false;
            this.logFallback(error);
        }
    }

    logFallback(error) {
        if (!this.fallbackLogged) {
            console.warn('[Rate Limit] Redis unavailable; using in-memory rate limiting.', error?.message || '');
            this.fallbackLogged = true;
        }
    }

    async increment(key) {
        if (redisClient?.isReady) {
            if (!this.redisInitialized) {
                await this.initializeRedis({ windowMs: this.memoryStore.windowMs });
            }

            if (this.redisInitialized) {
                try {
                    return await this.redisStore.increment(key);
                } catch (error) {
                    this.redisInitialized = false;
                    this.logFallback(error);
                }
            }
        } else {
            this.redisInitialized = false;
            this.logFallback();
        }

        return this.memoryStore.increment(key);
    }

    decrement(key) {
        if (this.redisInitialized) {
            return this.redisStore.decrement(key).catch((error) => {
                this.redisInitialized = false;
                this.logFallback(error);
                return this.memoryStore.decrement(key);
            });
        }
        return this.memoryStore.decrement(key);
    }

    resetKey(key) {
        if (this.redisInitialized) {
            return this.redisStore.resetKey(key).catch((error) => {
                this.redisInitialized = false;
                this.logFallback(error);
                return this.memoryStore.resetKey(key);
            });
        }
        return this.memoryStore.resetKey(key);
    }
}

const redisStore = (prefix) => new ResilientRateLimitStore(prefix);

const userOrIpKeyGenerator = (req) => (req.user?.id ? `user:${req.user.id}` : ipKeyGenerator(req.ip));

// General API rate limit - 300 requests per 15 minutes
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    skipSuccessfulRequests: false,
    passOnStoreError: true,
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
    passOnStoreError: true,
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
    passOnStoreError: true,
    keyGenerator: userOrIpKeyGenerator,
    message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore('rl:auth:')
});

// Write operations rate limit - 20 requests per minute
export const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    passOnStoreError: true,
    keyGenerator: userOrIpKeyGenerator,
    message: { success: false, message: 'Too many write requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisStore('rl:write:')
});
