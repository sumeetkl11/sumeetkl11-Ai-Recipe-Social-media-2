// backend/cache/redis.js
import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('ready', () => {
  console.log('✅ Redis Client Ready');
});

// Connect to Redis asynchronously without blocking server startup
redisClient.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
  console.warn('⚠️  Running without caching. Redis connection failed.');
});

export { redisClient };

/**
 * Generic cache getter with fallback
 * @param {string} key - Redis key
 * @param {Function} fallback - Function to call if key doesn't exist
 * @param {number} ttl - Time to live in seconds
 * @returns {*} Cached or fetched value
 */
export async function getOrSet(key, fallback, ttl = 300) {
  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const value = await fallback();
    if (value) {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    }
    return value;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to direct call if cache fails
    return await fallback();
  }
}

/**
 * Invalidate cache key
 * @param {string} key - Redis key
 */
export async function invalidateCache(key) {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

/**
 * Clear all cache keys matching pattern
 * @param {string} pattern - Key pattern (e.g., 'app:*')
 */
export async function clearCachePattern(pattern) {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Error clearing cache pattern:', error);
  }
}
