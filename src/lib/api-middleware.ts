import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { logger } from "./logger";
import { rateLimitMiddleware } from "./rate-limit";
import { LoggerError } from "./logger";

type RequestHandler<T = unknown> = (
  request: NextRequest,
  data?: T
) => Promise<Response>;

export function withErrorHandler<T>(
  handler: RequestHandler<T>
): RequestHandler<T> {
  return async (request: NextRequest, data?: T) => {
    try {
      // Apply rate limiting
      const rateLimitInfo = await rateLimitMiddleware(request);
      if (rateLimitInfo.status === 429) {
        return new NextResponse(
          JSON.stringify({
            error: "Too Many Requests",
            message: "Rate limit exceeded",
          }),
          {
            status: 429,
            headers: rateLimitInfo.headers,
          }
        );
      }

      // Execute handler
      const response = await handler(request, data);

      // Add rate limit headers to response
      rateLimitInfo.headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      logger.error("Request handler error", error as Error | LoggerError);

      return new NextResponse(
        JSON.stringify({
          error: "Internal Server Error",
          message: "An unexpected error occurred",
        }),
        { status: 500 }
      );
    }
  };
}

export function withValidation<T>(
  schema: z.Schema<T>,
  handler: RequestHandler<T>
): RequestHandler {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const data = schema.parse(body);
      return handler(request, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new NextResponse(
          JSON.stringify({
            error: "Validation Error",
            message: "Invalid request data",
            details: error.errors,
          }),
          { status: 400 }
        );
      }
      throw error;
    }
  };
}
