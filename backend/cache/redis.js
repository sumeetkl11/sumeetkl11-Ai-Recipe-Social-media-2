// backend/cache/redis.js
import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;
let redisClient = null;
let isRedisAvailable = false;

if (redisUrl) {
  redisClient = redis.createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.warn('⚠️  Redis max connection retries reached. Disabling Redis caching.');
          return false; // Stop reconnecting
        }
        return Math.min(retries * 100, 1000);
      }
    }
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    console.log('✅ Connected to Redis');
  });

  redisClient.on('error', (err) => {
    if (isRedisAvailable) {
      console.warn('⚠️  Redis Client Warning:', err.message);
    }
    isRedisAvailable = false;
  });

  redisClient.on('ready', () => {
    isRedisAvailable = true;
    console.log('✅ Redis Client Ready');
  });

  redisClient.connect().catch((err) => {
    isRedisAvailable = false;
    console.warn('⚠️  Running without Redis caching (connection failed).');
  });
} else {
  console.log('ℹ️  REDIS_URL not configured. Running with in-memory fallback (No Redis).');
}

// Safe wrapper proxy so calls to redisClient when Redis is offline do not crash or throw ECONNREFUSED
const safeRedisClient = {
  get isReady() {
    return isRedisAvailable && redisClient?.isReady;
  },
  async get(key) {
    if (!this.isReady) return null;
    try {
      return await redisClient.get(key);
    } catch {
      return null;
    }
  },
  async setEx(key, ttl, value) {
    if (!this.isReady) return null;
    try {
      return await redisClient.setEx(key, ttl, value);
    } catch {
      return null;
    }
  },
  async del(keys) {
    if (!this.isReady) return 0;
    try {
      return await redisClient.del(keys);
    } catch {
      return 0;
    }
  },
  async keys(pattern) {
    if (!this.isReady) return [];
    try {
      return await redisClient.keys(pattern);
    } catch {
      return [];
    }
  },
  async sendCommand(args) {
    if (!this.isReady) return null;
    try {
      return await redisClient.sendCommand(args);
    } catch {
      return null;
    }
  }
};

export { safeRedisClient as redisClient };
