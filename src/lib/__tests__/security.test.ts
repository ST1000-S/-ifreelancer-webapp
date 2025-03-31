import {
  securityMiddleware,
  sanitizeSQL,
  sanitizeHTML,
  isAllowedFileType,
  validateToken,
  isStrongPassword,
  getRateLimitKey,
  validateRequestHeaders,
} from "../security";
import { NextResponse } from "next/server";
import { jest } from "@jest/globals";

// Mock logger
jest.mock("../logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Security Features", () => {
  describe("Security Middleware", () => {
    const mockRequest = new Request("http://localhost:3000");

    test("should apply default security headers", () => {
      const response = securityMiddleware(mockRequest);
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.headers.get("Content-Security-Policy")).toBeDefined();
      expect(response.headers.get("Strict-Transport-Security")).toBeDefined();
      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
      expect(response.headers.get("X-XSS-Protection")).toBe("1; mode=block");
    });

    test("should allow custom trusted domains in CSP", () => {
      const response = securityMiddleware(mockRequest, {
        trustedDomains: ["https://api.example.com"],
      });
      const csp = response.headers.get("Content-Security-Policy");
      expect(csp).toContain("https://api.example.com");
    });
  });

  describe("SQL Injection Prevention", () => {
    test("should sanitize SQL injection attempts", () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const sanitized = sanitizeSQL(maliciousInput);
      expect(sanitized).not.toContain("DROP TABLE");
      expect(sanitized).not.toContain(";");
      expect(sanitized).not.toContain("--");
    });

    test("should preserve valid input", () => {
      const validInput = "user123";
      expect(sanitizeSQL(validInput)).toBe(validInput);
    });
  });

  describe("XSS Prevention", () => {
    test("should sanitize HTML special characters", () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const sanitized = sanitizeHTML(maliciousInput);
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain("&lt;script&gt;");
    });

    test("should handle multiple special characters", () => {
      const input = '"><&';
      expect(sanitizeHTML(input)).toBe("&quot;&gt;&lt;&amp;");
    });
  });

  describe("File Type Validation", () => {
    test("should allow valid file types", () => {
      expect(isAllowedFileType("document.pdf")).toBe(true);
      expect(isAllowedFileType("image.jpg")).toBe(true);
      expect(isAllowedFileType("file.docx")).toBe(true);
    });

    test("should reject invalid file types", () => {
      expect(isAllowedFileType("script.js")).toBe(false);
      expect(isAllowedFileType("malicious.exe")).toBe(false);
      expect(isAllowedFileType("file")).toBe(false);
    });

    test("should handle custom allowed types", () => {
      const allowedTypes = ["csv", "txt"];
      expect(isAllowedFileType("data.csv", allowedTypes)).toBe(true);
      expect(isAllowedFileType("document.pdf", allowedTypes)).toBe(false);
    });
  });

  describe("Token Validation", () => {
    test("should validate correct JWT format", () => {
      const validToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
      expect(validateToken(validToken)).toBe(true);
    });

    test("should reject invalid token formats", () => {
      expect(validateToken("invalid-token")).toBe(false);
      expect(validateToken("")).toBe(false);
      expect(validateToken("token.with.too.many.parts")).toBe(false);
    });
  });

  describe("Password Strength Validation", () => {
    test("should validate strong passwords", () => {
      expect(isStrongPassword("StrongP@ss123")).toBe(true);
      expect(isStrongPassword("C0mpl3x!P@ssw0rd")).toBe(true);
    });

    test("should reject weak passwords", () => {
      expect(isStrongPassword("password")).toBe(false); // No uppercase, numbers, or special chars
      expect(isStrongPassword("Password")).toBe(false); // No numbers or special chars
      expect(isStrongPassword("pass123")).toBe(false); // No uppercase or special chars
      expect(isStrongPassword("Pa1!")).toBe(false); // Too short
    });
  });

  describe("Rate Limit Key Generation", () => {
    test("should generate unique keys for different IPs and endpoints", () => {
      const req1 = new Request("http://localhost:3000/api/users", {
        headers: { "x-forwarded-for": "1.1.1.1" },
      });
      const req2 = new Request("http://localhost:3000/api/users", {
        headers: { "x-forwarded-for": "2.2.2.2" },
      });
      const req3 = new Request("http://localhost:3000/api/posts", {
        headers: { "x-forwarded-for": "1.1.1.1" },
      });

      const key1 = getRateLimitKey(req1);
      const key2 = getRateLimitKey(req2);
      const key3 = getRateLimitKey(req3);

      expect(key1).not.toBe(key2); // Different IPs
      expect(key1).not.toBe(key3); // Same IP, different endpoints
    });
  });

  describe("Request Headers Validation", () => {
    test("should validate correct headers for POST requests", () => {
      const validRequest = new Request("http://localhost:3000", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "*/*",
          origin: "http://localhost:3000",
        },
      });
      expect(validateRequestHeaders(validRequest)).toBe(true);
    });

    test("should reject invalid content type for POST requests", () => {
      const invalidRequest = new Request("http://localhost:3000", {
        method: "POST",
        headers: {
          "content-type": "text/plain",
          accept: "*/*",
        },
      });
      expect(validateRequestHeaders(invalidRequest)).toBe(false);
    });

    test("should reject requests from unauthorized origins", () => {
      const invalidRequest = new Request("http://localhost:3000", {
        headers: {
          accept: "*/*",
          origin: "http://malicious-site.com",
        },
      });
      expect(validateRequestHeaders(invalidRequest)).toBe(false);
    });
  });
});
