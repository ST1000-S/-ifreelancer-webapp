import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Handle cleanup
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  logger.info("Database connection closed");
});

// Handle errors and reconnection
prisma.$use(async (params, next) => {
  const startTime = Date.now();
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
    logger.error("Database operation failed", error as Error, {
      model: params.model,
      action: params.action,
      args: params.args,
    });

    // Attempt to reconnect only for connection errors
    if (error instanceof Error && error.message.includes("connection")) {
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        logger.info("Successfully reconnected to database");
      } catch (reconnectError) {
        logger.error(
          "Failed to reconnect to database",
          reconnectError as Error
        );
      }
    }

    throw error;
  }
});

// Handle connection events
prisma.$on("beforeExit", () => {
  logger.info("Closing database connection");
});
