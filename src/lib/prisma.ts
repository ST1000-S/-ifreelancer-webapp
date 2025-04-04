import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// Logging middleware
prisma.$on("query", (e: Prisma.QueryEvent) => {
  logger.debug("Query: " + e.query);
  logger.debug("Duration: " + e.duration + "ms");
});

prisma.$on("error", (e: Prisma.LogEvent) => {
  logger.error("Prisma Error: " + e.message);
});

prisma.$on("info", (e: Prisma.LogEvent) => {
  logger.info("Prisma Info: " + e.message);
});

prisma.$on("warn", (e: Prisma.LogEvent) => {
  logger.warn("Prisma Warning: " + e.message);
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

// Handle cleanup
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  logger.info("Database connection closed");
});

// Handle errors and reconnection
prisma.$use(async (params, next) => {
  const startTime = Date.now();
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const result = await next(params);
      const duration = Date.now() - startTime;

      // Log slow queries (over 1 second)
      if (duration > 1000) {
        logger.warn("Slow database query detected", {
          model: params.model,
          action: params.action,
          duration: `${duration}ms`,
        });
      }

      return result;
    } catch (error) {
      retries++;
      logger.error("Database operation failed", error as Error, {
        model: params.model,
        action: params.action,
        args: params.args,
        attempt: retries,
      });

      // Attempt to reconnect only for connection errors
      if (
        error instanceof Error &&
        (error.message.includes("connection") ||
          error.message.includes("timeout") ||
          error.message.includes("pool"))
      ) {
        try {
          await prisma.$disconnect();
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries)); // Exponential backoff
          await prisma.$connect();
          logger.info("Successfully reconnected to database", {
            attempt: retries,
          });
          continue; // Retry the operation
        } catch (reconnectError) {
          logger.error(
            "Failed to reconnect to database",
            reconnectError as Error,
            {
              attempt: retries,
            }
          );
        }
      }

      // If we've exhausted retries or it's not a connection error, throw
      if (retries === maxRetries) {
        throw error;
      }
    }
  }
});

// Handle connection events
prisma.$on("beforeExit", () => {
  logger.info("Closing database connection");
});
