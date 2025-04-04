import { jest } from "@jest/globals";
import {
  securityMiddleware,
  sanitizeSQL,
  sanitizeHTML,
  isAllowedFileType,
  validateToken,
  isStrongPassword,
  getRateLimitKey,
  validateRequestHeaders,
  generateRateLimitKey,
} from "../security";
import { logger as Logger } from "../logger-impl";
import { NextResponse } from "next/server";

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

// Mock NextResponse
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

describe("Security", () => {
  const mockRequestHeaders = new Headers({
    "content-type": "application/json",
    accept: "application/json",
    origin: "https://example.com",
    "x-forwarded-for": "1.2.3.4",
  });

  const mockRequest = new Request("https://example.com/api/test", {
    method: "POST",
    headers: mockRequestHeaders,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Security Headers", () => {
    it("should apply default security headers", () => {
      const request = new Request("http://localhost:3000/api/test", {
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          origin: "http://localhost:3000",
        },
      });

      const response = securityMiddleware(request) as MockResponse;
      expect(response.status).toBe(200);

      const headers = response.headers;
      expect(headers.get("X-Frame-Options")).toBe("DENY");
      expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(headers.get("X-XSS-Protection")).toBe("1; mode=block");
      expect(headers.get("Referrer-Policy")).toBe(
        "strict-origin-when-cross-origin"
      );
      expect(headers.get("Content-Security-Policy")).toBe(
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
      );
      expect(headers.get("Strict-Transport-Security")).toBe(
        "max-age=31536000; includeSubDomains"
      );
    });
  });

  describe("SQL Sanitization", () => {
    it("should remove SQL injection attempts", () => {
      const input = "Robert'); DROP TABLE Users;--";
      const sanitized = sanitizeSQL(input);
      expect(sanitized).not.toContain("DROP TABLE");
      expect(sanitized).not.toContain(";");
      expect(sanitized).not.toContain("--");
    });

    it("should handle SQL keywords", () => {
      const input = 'SELECT * FROM users WHERE name = "John"';
      const sanitized = sanitizeSQL(input);
      expect(sanitized).not.toContain("SELECT");
      expect(sanitized).not.toContain("FROM");
      expect(sanitized).not.toContain("WHERE");
    });

    it("should escape single quotes", () => {
      const input = "O'Connor";
      const sanitized = sanitizeSQL(input);
      expect(sanitized).toBe("O''Connor");
    });
  });

  describe("HTML Sanitization", () => {
    it("should remove XSS attempts", () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const sanitized = sanitizeHTML(maliciousInput);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("</script>");
    });

    it("should preserve valid HTML", () => {
      const validInput = "<p>Hello, <b>world</b>!</p>";
      const sanitized = sanitizeHTML(validInput);

      expect(sanitized).toBe(
        "&lt;p&gt;Hello, &lt;b&gt;world&lt;/b&gt;!&lt;/p&gt;"
      );
    });
  });

  describe("File Type Validation", () => {
    it("should allow valid file types", () => {
      expect(isAllowedFileType("document.pdf")).toBe(true);
      expect(isAllowedFileType("image.jpg")).toBe(true);
      expect(isAllowedFileType("file.docx")).toBe(true);
    });

    it("should reject dangerous file types", () => {
      expect(isAllowedFileType("script.exe")).toBe(false);
      expect(isAllowedFileType("malware.bat")).toBe(false);
      expect(isAllowedFileType("hack.php")).toBe(false);
    });
  });

  describe("Token Validation", () => {
    it("should validate correct token format", () => {
      const validToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
      expect(validateToken(validToken)).toBe(true);
    });

    it("should reject invalid token format", () => {
      expect(validateToken("invalid-token")).toBe(false);
      expect(validateToken("")).toBe(false);
      expect(validateToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")).toBe(false);
    });
  });

  describe("Request Headers Validation", () => {
    it("should validate content type header", () => {
      const headers = new MockHeaders({
        "content-type": "text/plain",
        accept: "application/json",
        origin: "http://localhost:3000",
      });

      expect(validateRequestHeaders(headers as unknown as Headers)).toBe(false);
      expect(Logger.warn).toHaveBeenCalledWith("Invalid content type header");
    });

    it("should validate accept header", () => {
      const headers = new MockHeaders({
        "content-type": "application/json",
        accept: "text/plain",
        origin: "http://localhost:3000",
      });

      expect(validateRequestHeaders(headers as unknown as Headers)).toBe(false);
      expect(Logger.warn).toHaveBeenCalledWith("Invalid accept header");
    });

    it("should validate origin header", () => {
      const headers = new MockHeaders({
        "content-type": "application/json",
        accept: "application/json",
        origin: "invalid-origin",
      });

      expect(validateRequestHeaders(headers as unknown as Headers)).toBe(false);
      expect(Logger.warn).toHaveBeenCalledWith("Invalid origin header");
    });

    it("should accept valid headers", () => {
      const headers = new MockHeaders({
        "content-type": "application/json",
        accept: "application/json",
        origin: "http://localhost:3000",
      });

      expect(validateRequestHeaders(headers as unknown as Headers)).toBe(true);
    });
  });

  describe("Password Strength Validation", () => {
    it("should validate strong passwords", () => {
      expect(isStrongPassword("StrongP@ss123")).toBe(true);
      expect(isStrongPassword("C0mpl3x!P@ssw0rd")).toBe(true);
    });

    it("should reject weak passwords", () => {
      expect(isStrongPassword("weak")).toBe(false);
      expect(isStrongPassword("password123")).toBe(false);
      expect(isStrongPassword("NoSpecialChar1")).toBe(false);
    });
  });

  describe("Rate Limit Key Generation", () => {
    it("should generate valid rate limit key", () => {
      const ip = "127.0.0.1";
      const url = "http://localhost:3000/api/test";
      const key = generateRateLimitKey(ip, url);
      expect(key).toBe("127.0.0.1:/api/test");
    });

    it("should handle invalid URLs", () => {
      const ip = "127.0.0.1";
      const url = "invalid-url";
      const key = generateRateLimitKey(ip, url);
      expect(key).toBe("127.0.0.1:error");
      expect(Logger.error).toHaveBeenCalled();
    });
  });
});
