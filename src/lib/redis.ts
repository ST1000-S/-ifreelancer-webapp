import Redis from "ioredis";
import { logger } from "./logger";

function validateRedisConfig(): string {
  if (!process.env.REDIS_URL) {
    const error = new Error(
      "REDIS_URL is not defined in environment variables. " +
        "Please set your Upstash Redis URL in the .env.local file."
    );
    logger.error("Redis configuration error", {
      message: error.message,
      code: "REDIS_CONFIG_ERROR",
    });
    throw error;
  }

  try {
    const url = new URL(process.env.REDIS_URL);
    if (!url.password) {
      throw new Error("Redis URL must include password");
    }
    if (!url.hostname) {
      throw new Error("Redis URL must include hostname");
    }
    return process.env.REDIS_URL;
  } catch (error) {
    const configError = new Error(
      `Invalid REDIS_URL format: ${error instanceof Error ? error.message : "Unknown error"}. ` +
        "Please ensure it's in the format: redis://default:password@hostname:port"
    );
    logger.error("Redis configuration error", {
      message: configError.message,
      code: "REDIS_CONFIG_ERROR",
    });
    throw configError;
  }
}

// Validate Redis configuration before attempting to connect
const redisUrl = validateRedisConfig();

logger.info("Initializing Redis connection", { url: redisUrl });

// Create Redis client with Upstash configuration
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3, // Reduce from default 20 to fail faster
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    logger.debug("Redis retry attempt", { times, delay });
    return delay;
  },
  enableOfflineQueue: true, // Enable offline queue for better reliability
  lazyConnect: false, // Connect immediately
  tls: {
    rejectUnauthorized: false, // Required for secure connection
  },
});

// Handle Redis connection events
redis.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

redis.on("error", (error) => {
  logger.error("Redis connection error:", {
    message: error.message,
    stack: error.stack,
  });
});

redis.on("ready", () => {
  logger.info("Redis client is ready");
});

redis.on("reconnecting", () => {
  logger.info("Redis client is reconnecting");
});

// Initialize Redis connection
let redisConnected = false;
let connectionPromise: Promise<void> | null = null;

async function ensureRedisConnection() {
  if (redisConnected) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        await redis.ping();
        logger.info("Redis PING successful");
        redisConnected = true;
      } catch (error) {
        logger.error("Redis connection failed:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
        connectionPromise = null;
        throw error;
      }
    })();
  }

  await connectionPromise;
}

// Initialize connection
ensureRedisConnection().catch((error) => {
  logger.error("Initial Redis connection failed", {
    message: error instanceof Error ? error.message : "Unknown error",
  });
});

export { redis, ensureRedisConnection };
