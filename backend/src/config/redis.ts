import Redis from 'ioredis';
import { config } from './env';

/** Singleton Redis client with graceful fallback */
let redisConnected = false;

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    if (times > 3) {
      console.warn('⚠️  Redis unavailable — running without cache/denylist');
      return null; // stop retrying
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
  enableOfflineQueue: false,
});

redis.on('error', (err) => {
  if (redisConnected) {
    console.error('Redis connection lost:', err.message);
    redisConnected = false;
  }
});

redis.on('connect', () => {
  redisConnected = true;
  console.log('✅ Redis connected');
});

/** Check if Redis is available */
export function isRedisAvailable(): boolean {
  return redisConnected;
}

/** Safe Redis get — returns null if Redis is down */
export async function safeGet(key: string): Promise<string | null> {
  if (!redisConnected) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

/** Safe Redis set — silently fails if Redis is down */
export async function safeSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (!redisConnected) return;
  try {
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      await redis.set(key, value);
    }
  } catch {
    // silently ignore
  }
}

/** Safe Redis del */
export async function safeDel(key: string): Promise<void> {
  if (!redisConnected) return;
  try {
    await redis.del(key);
  } catch {
    // silently ignore
  }
}

/** Safe Redis incr */
export async function safeIncr(key: string): Promise<number> {
  if (!redisConnected) return 0;
  try {
    return await redis.incr(key);
  } catch {
    return 0;
  }
}

/** Safe Redis expire */
export async function safeExpire(key: string, seconds: number): Promise<void> {
  if (!redisConnected) return;
  try {
    await redis.expire(key, seconds);
  } catch {
    // silently ignore
  }
}
