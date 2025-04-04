import { jest } from "@jest/globals";
import {
  rateLimit,
  rateLimitMiddleware,
  store,
  getRateLimitKey,
  generateRateLimitKey,
} from "../rate-limit";
import { NextResponse, NextRequest } from "next/server";
import { logger as Logger } from "../logger-impl";

interface MockResponse {
  headers: Headers;
  status: number;
  body?: unknown;
}

// Mock Headers class
class MockHeaders {
  private store: Map<string, string>;

  constructor(init?: Record<string, string>) {
    this.store = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.store.set(key.toLowerCase(), value);
      });
    }
  }

  get(key: string): string | null {
    return this.store.get(key.toLowerCase()) || null;
  }

  set(key: string, value: string): void {
    this.store.set(key.toLowerCase(), value);
  }

  forEach(callback: (value: string, key: string) => void): void {
    this.store.forEach((value, key) => callback(value, key));
  }
}

jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => ({
      headers: new MockHeaders(),
      status: 200,
    })),
    json: jest.fn(
      (
        body: unknown,
        options: { headers: Headers; status: number }
      ): MockResponse => ({
        headers: options.headers,
        status: options.status,
        body,
      })
    ),
  },
}));

jest.mock("../logger-impl", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Rate Limiter", () => {
  const mockRequest = new Request("http://localhost:3000/api/test", {
    method: "GET",
    headers: {
      "x-forwarded-for": "1.2.3.4",
      "content-type": "application/json",
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the store before each test
    Object.keys(store).forEach((key) => delete store[key]);
  });

  it("should allow requests within the limit", () => {
    const key = generateRateLimitKey(mockRequest);
    const result = rateLimit(key, 100, 3600000); // 100 requests per hour
    expect(result).toBe(true);
    expect(store[key].count).toBe(1);
  });

  it("should reset after time window", () => {
    const key = generateRateLimitKey(mockRequest);
    rateLimit(key, 100, 1000); // 100 requests per second
    jest.advanceTimersByTime(1500); // Advance past the window
    const result = rateLimit(key, 100, 1000);
    expect(result).toBe(true);
    expect(store[key].count).toBe(1);
  });

  it("should handle different keys separately", () => {
    const key1 = generateRateLimitKey(mockRequest);
    const key2 = generateRateLimitKey(
      new Request("http://localhost:3000/api/other", {
        method: "GET",
        headers: {
          "x-forwarded-for": "5.6.7.8",
          "content-type": "application/json",
        },
      })
    );

    rateLimit(key1, 100, 3600000);
    rateLimit(key2, 100, 3600000);

    expect(store[key1].count).toBe(1);
    expect(store[key2].count).toBe(1);
    expect(key1).not.toBe(key2);
  });
});

describe("Rate Limit Middleware", () => {
  const mockRequest = new Request("http://localhost:3000/api/test", {
    method: "GET",
    headers: {
      "x-forwarded-for": "1.2.3.4",
      "content-type": "application/json",
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(store).forEach((key) => delete store[key]);
  });

  it("should allow requests within limit", async () => {
    const response = await rateLimitMiddleware(mockRequest);
    const headers = new Headers(response.headers);

    expect(response.status).toBe(200);
    expect(headers.get("X-RateLimit-Limit")).toBe("60");
    expect(headers.get("X-RateLimit-Remaining")).toBe("59");
    expect(headers.get("X-RateLimit-Reset")).toBeTruthy();
    expect(Logger.info).toHaveBeenCalledWith(
      "Request allowed by rate limiter",
      expect.any(Object)
    );
  });

  it("should block requests over limit", async () => {
    const key = generateRateLimitKey(mockRequest);
    store[key] = {
      count: 60,
      resetTime: Date.now() + 3600000,
    };

    const response = await rateLimitMiddleware(mockRequest);
    const headers = new Headers(response.headers);

    expect(response.status).toBe(429);
    expect(headers.get("X-RateLimit-Limit")).toBe("60");
    expect(headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(headers.get("Retry-After")).toBeTruthy();
    expect(Logger.warn).toHaveBeenCalledWith(
      "Rate limit exceeded",
      expect.any(Object)
    );
  });

  it("should handle different IP addresses separately", async () => {
    const request1 = new Request("http://localhost:3000/api/test", {
      method: "GET",
      headers: {
        "x-forwarded-for": "1.2.3.4",
        "content-type": "application/json",
      },
    });

    const request2 = new Request("http://localhost:3000/api/test", {
      method: "GET",
      headers: {
        "x-forwarded-for": "5.6.7.8",
        "content-type": "application/json",
      },
    });

    const response1 = await rateLimitMiddleware(request1);
    const response2 = await rateLimitMiddleware(request2);

    const headers1 = new Headers(response1.headers);
    const headers2 = new Headers(response2.headers);

    expect(headers1.get("X-RateLimit-Remaining")).toBe("59");
    expect(headers2.get("X-RateLimit-Remaining")).toBe("59");
  });

  it("should handle errors gracefully", async () => {
    const request = new Request("invalid-url", {
      headers: {
        "x-forwarded-for": "1.2.3.4",
      },
    });

    const response = await rateLimitMiddleware(request);
    expect(response.status).toBe(200);
    expect(Logger.error).toHaveBeenCalled();
  });
});

describe("Rate Limiting", () => {
  const mockRequestHeaders = new Headers();
  mockRequestHeaders.set("x-forwarded-for", "127.0.0.1");

  const mockRequest = new Request("https://example.com/api/test", {
    method: "POST",
    headers: mockRequestHeaders,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestHeaders.delete("x-forwarded-for");
    mockRequestHeaders.set("x-forwarded-for", "127.0.0.1");
  });

  it("should initialize store entries", () => {
    const key = getRateLimitKey(mockRequest);
    const result = rateLimit(key, 100, 3600000); // 100 requests per hour
    expect(result).toBe(true);
  });

  it("should increment count for existing entries", () => {
    const key = getRateLimitKey(mockRequest);

    rateLimit(key, 100, 3600000);
    const result = rateLimit(key, 100, 3600000);

    expect(result).toBe(true);
  });

  it("should reset count after time window", () => {
    const key = getRateLimitKey(mockRequest);

    rateLimit(key, 100, 3600000);
    jest.advanceTimersByTime(3600000); // 1 hour
    const result = rateLimit(key, 100, 3600000);

    expect(result).toBe(true);
  });

  it("should return false when limit exceeded", () => {
    const key = getRateLimitKey(mockRequest);
    const limit = 100;

    for (let i = 0; i < limit; i++) {
      rateLimit(key, limit, 3600000);
    }
    const result = rateLimit(key, limit, 3600000);

    expect(result).toBe(false);
  });

  it("should generate unique keys for different requests", () => {
    const mockRequest2 = new Request("https://example.com/api/test", {
      method: "POST",
      headers: new Headers({
        "x-forwarded-for": "127.0.0.2",
      }),
    });

    const key1 = getRateLimitKey(mockRequest);
    const key2 = getRateLimitKey(mockRequest2);

    expect(key1).not.toBe(key2);
  });

  describe("Middleware", () => {
    it("should return 429 when limit exceeded", async () => {
      const key = getRateLimitKey(mockRequest);
      const limit = 60;

      for (let i = 0; i < limit; i++) {
        rateLimit(key, limit, 3600000);
      }

      const response = await rateLimitMiddleware(mockRequest, limit, 3600000);
      expect(response.status).toBe(429);

      const headers = new Headers(response.headers);
      expect(headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(headers.get("Retry-After")).toBeTruthy();
    });

    it("should return 200 when under limit", async () => {
      const response = await rateLimitMiddleware(mockRequest, 100, 3600000);
      expect(response.status).toBe(200);

      const headers = new Headers(response.headers);
      expect(headers.get("X-RateLimit-Remaining")).toBe("59");
      expect(headers.get("X-RateLimit-Reset")).toBeTruthy();
    });

    it("should handle missing IP address", async () => {
      const mockRequestNoIP = new Request("https://example.com/api/test", {
        method: "POST",
        headers: new Headers(),
      });

      const response = await rateLimitMiddleware(mockRequestNoIP);
      expect(response).toBeDefined();
    });
  });
});
