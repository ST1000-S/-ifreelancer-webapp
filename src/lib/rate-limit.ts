import { NextResponse } from "next/server";
import { logger as Logger } from "./logger-impl";
import { generateRateLimitKey } from "./security";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

export function rateLimit(key: string): boolean {
  const now = Date.now();

  // Initialize or reset if window has passed
  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    return true;
  }

  // Increment count if within window
  if (store[key].count < MAX_REQUESTS) {
    store[key].count++;
    return true;
  }

  return false;
}

export function rateLimitMiddleware(request: Request): NextResponse {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const key = generateRateLimitKey(ip, request.url);
    const isAllowed = rateLimit(key);
    const headers = new Headers();

    // Set rate limit headers
    const remaining = isAllowed ? MAX_REQUESTS - (store[key]?.count || 0) : 0;
    const reset = store[key]?.resetTime || Date.now() + WINDOW_MS;

    headers.set("X-RateLimit-Limit", String(MAX_REQUESTS));
    headers.set("X-RateLimit-Remaining", String(remaining));
    headers.set("X-RateLimit-Reset", String(Math.ceil(reset / 1000))); // Convert to seconds

    if (!isAllowed) {
      headers.set(
        "Retry-After",
        String(Math.ceil((reset - Date.now()) / 1000))
      );
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers }
      );
    }

    const response = NextResponse.next();
    // Copy rate limit headers to response
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    Logger.error(
      "Rate limit error:",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.next();
  }
}
