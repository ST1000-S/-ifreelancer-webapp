import Redis from "ioredis";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function testRedis() {
  const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      console.log("Redis retry attempt:", times, "delay:", delay);
      return delay;
    },
    enableOfflineQueue: true,
    lazyConnect: false,
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Testing Redis connection...");
    console.log("Redis URL:", process.env.REDIS_URL);

    // Handle Redis events
    redis.on("connect", () => console.log("Redis connected"));
    redis.on("error", (err) => console.error("Redis error:", err));
    redis.on("ready", () => console.log("Redis ready"));
    redis.on("reconnecting", () => console.log("Redis reconnecting"));

    // Test connection
    const pingResult = await redis.ping();
    console.log("Redis PING result:", pingResult);

    // Test basic operations
    await redis.set("test-key", "test-value");
    const value = await redis.get("test-key");
    console.log("Redis GET result:", value);

    // Clean up
    await redis.del("test-key");
    await redis.quit();
  } catch (error) {
    console.error("Redis test failed:", error);
    process.exit(1);
  }
}

testRedis().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
