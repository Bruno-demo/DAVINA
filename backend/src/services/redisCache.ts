import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";
let redisClient: any = null;
let redisAvailable = false;

/** Initialize Redis connection (call once at startup) */
export async function initRedis(): Promise<void> {
  try {
    const Redis = require("ioredis");
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 5) return null; // stop retrying after 5 attempts
        return Math.min(times * 500, 3000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on("connect", () => {
      logger.info("Redis connected");
      redisAvailable = true;
    });
    redisClient.on("error", () => {
      redisAvailable = false;
    });
    redisClient.on("close", () => {
      redisAvailable = false;
    });

    await redisClient.connect();
    redisAvailable = true;
  } catch {
    logger.warn("Redis not available — caching disabled");
    redisClient = null;
    redisAvailable = false;
  }
}

/** Get the Redis client (may be null if not connected) */
export function getRedis(): any {
  return redisClient;
}

/**
 * Express middleware that caches GET responses in Redis.
 * @param ttlSeconds - Cache TTL in seconds (default: 300 = 5 min)
 */
export function cacheMiddleware(ttlSeconds = 300) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!redisClient || !redisAvailable || req.method !== "GET") return next();

    const key = `cache:${req.originalUrl}`;
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.json(JSON.parse(cached));
        return;
      }
    } catch {
      // Redis down — fall through
    }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (redisClient && redisAvailable && res.statusCode >= 200 && res.statusCode < 300) {
        redisClient.setex(key, ttlSeconds, JSON.stringify(body)).catch(() => {});
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
}

/** Invalidate cache keys matching a pattern */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!redisClient || !redisAvailable) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch {
    // Ignore
  }
}
