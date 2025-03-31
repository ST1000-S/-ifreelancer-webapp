import { rateLimit, rateLimitMiddleware } from "../rate-limit";
import { NextResponse } from "next/server";

describe("Rate Limiter", () => {
  beforeEach(() => {
    // Clear rate limit store between tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should allow requests within limit", () => {
    const key = "test-key";
    const limit = 3;
    const windowMs = 1000;

    expect(rateLimit(key, limit, windowMs)).toBe(true);
    expect(rateLimit(key, limit, windowMs)).toBe(true);
    expect(rateLimit(key, limit, windowMs)).toBe(true);
    expect(rateLimit(key, limit, windowMs)).toBe(false);
  });

  test("should reset after window expires", () => {
    const key = "test-key";
    const limit = 2;
    const windowMs = 1000;

    expect(rateLimit(key, limit, windowMs)).toBe(true);
    expect(rateLimit(key, limit, windowMs)).toBe(true);
    expect(rateLimit(key, limit, windowMs)).toBe(false);

    // Advance time past window
    jest.advanceTimersByTime(windowMs + 100);

    // Should be allowed again
    expect(rateLimit(key, limit, windowMs)).toBe(true);
  });

  test("middleware should return 429 when limit exceeded", () => {
    const req = new Request("http://test.com", {
      headers: {
        "x-forwarded-for": "127.0.0.1",
      },
    });

    const limit = 2;
    const windowMs = 1000;

    // First two requests should pass
    expect(rateLimitMiddleware(req, limit, windowMs)).toBeNull();
    expect(rateLimitMiddleware(req, limit, windowMs)).toBeNull();

    // Third request should be blocked
    const response = rateLimitMiddleware(req, limit, windowMs);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.status).toBe(429);
    expect(response?.headers.get("Retry-After")).toBeDefined();
  });

  test("should handle different IP addresses separately", () => {
    const makeRequest = (ip: string) =>
      new Request("http://test.com", {
        headers: {
          "x-forwarded-for": ip,
        },
      });

    const limit = 2;
    const windowMs = 1000;

    // IP 1 should get its own limit
    const req1 = makeRequest("1.1.1.1");
    expect(rateLimitMiddleware(req1, limit, windowMs)).toBeNull();
    expect(rateLimitMiddleware(req1, limit, windowMs)).toBeNull();
    expect(rateLimitMiddleware(req1, limit, windowMs)?.status).toBe(429);

    // IP 2 should get its own limit
    const req2 = makeRequest("2.2.2.2");
    expect(rateLimitMiddleware(req2, limit, windowMs)).toBeNull();
    expect(rateLimitMiddleware(req2, limit, windowMs)).toBeNull();
    expect(rateLimitMiddleware(req2, limit, windowMs)?.status).toBe(429);
  });
});
