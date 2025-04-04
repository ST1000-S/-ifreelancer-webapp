import { NextResponse, NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/api-middleware";
import { rateLimitMiddleware } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

async function handler(request: NextRequest) {
  try {
    logger.info("Test endpoint called", {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    });

    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request);
    logger.info("Rate limit result", {
      status: rateLimitResult.status,
      headers: Object.fromEntries(rateLimitResult.headers.entries()),
    });

    // If rate limit is exceeded, return 429 response
    if (rateLimitResult.status === 429) {
      logger.warn("Rate limit exceeded", {
        url: request.url,
        headers: Object.fromEntries(rateLimitResult.headers.entries()),
      });

      return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
        status: 429,
        headers: rateLimitResult.headers,
      });
    }

    // Return success response with rate limit headers
    const response = new NextResponse(
      JSON.stringify({ message: "Test endpoint" }),
      {
        status: 200,
        headers: rateLimitResult.headers,
      }
    );

    logger.info("Sending response", {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    });

    return response;
  } catch (error) {
    logger.error(
      "Error in test endpoint:",
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

export const GET = withErrorHandler(handler);
