import { NextResponse } from "next/server";
import { logger } from "./logger";

interface RateLimitRecord {
  count: number;
  resetTime: number;
  firstAttempt: number;
}

interface RateLimitStore {
  [key: string]: RateLimitRecord;
}

const store: RateLimitStore = {};
const MAX_STORE_SIZE = 10000; // Maximum number of records to prevent memory leaks

function cleanStore() {
  const now = Date.now();
  const entries = Object.entries(store);

  // Remove expired entries
  for (const [key, value] of entries) {
    if (value.resetTime < now) {
      delete store[key];
    }
  }

  // If still too many entries, remove oldest based on firstAttempt
  if (Object.keys(store).length > MAX_STORE_SIZE) {
    const sortedEntries = entries.sort(
      (a, b) => a[1].firstAttempt - b[1].firstAttempt
    );
    const entriesToRemove = sortedEntries.slice(
      0,
      sortedEntries.length - MAX_STORE_SIZE
    );
    for (const [key] of entriesToRemove) {
      delete store[key];
    }
  }
}

export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = store[key];

  // Clean up expired records first
  if (record && now > record.resetTime) {
    delete store[key];
  }

  // If no record or record was expired, create new one
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
      firstAttempt: now,
    };
    return true;
  }

  // Check if we've hit the limit
  if (store[key].count >= limit) {
    // Log rate limit exceeded
    logger.warn("Rate limit exceeded", {
      key,
      count: store[key].count,
      resetTime: new Date(store[key].resetTime).toISOString(),
    });
    return false;
  }

  // Increment count
  store[key].count++;
  return true;
}

export function rateLimitMiddleware(
  req: Request,
  limit: number = 10,
  windowMs: number = 60000
) {
  // Get IP from various headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0].trim() || realIp || "unknown";

  // Create a unique key combining IP and route
  const url = new URL(req.url);
  const route = url.pathname;
  const key = `${ip}:${route}`;

  if (!rateLimit(key, limit, windowMs)) {
    logger.warn("Rate limit exceeded for request", {
      ip,
      route,
      limit,
      windowMs,
    });

    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: Math.ceil((store[key].resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (store[key].resetTime - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  return null;
}

// Clean up old records every minute
setInterval(cleanStore, 60000);
