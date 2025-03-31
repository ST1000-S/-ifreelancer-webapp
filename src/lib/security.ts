import { NextResponse } from "next/server";
import { logger } from "./logger";

interface SecurityOptions {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableNoSniff?: boolean;
  enableFrameOptions?: boolean;
  enableXSSProtection?: boolean;
  trustedDomains?: string[];
}

const defaultOptions: SecurityOptions = {
  enableCSP: true,
  enableHSTS: true,
  enableNoSniff: true,
  enableFrameOptions: true,
  enableXSSProtection: true,
  trustedDomains: [],
};

export function securityMiddleware(
  req: Request,
  options: SecurityOptions = {}
) {
  const mergedOptions = { ...defaultOptions, ...options };
  const headers = new Headers();

  try {
    // Content Security Policy
    if (mergedOptions.enableCSP) {
      const trustedDomains = mergedOptions.trustedDomains?.join(" ") || "";
      headers.set(
        "Content-Security-Policy",
        `default-src 'self' ${trustedDomains}; ` +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' https:; " +
          "frame-ancestors 'none';"
      );
    }

    // HTTP Strict Transport Security
    if (mergedOptions.enableHSTS) {
      headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    // X-Content-Type-Options
    if (mergedOptions.enableNoSniff) {
      headers.set("X-Content-Type-Options", "nosniff");
    }

    // X-Frame-Options
    if (mergedOptions.enableFrameOptions) {
      headers.set("X-Frame-Options", "DENY");
    }

    // X-XSS-Protection
    if (mergedOptions.enableXSSProtection) {
      headers.set("X-XSS-Protection", "1; mode=block");
    }

    // Additional security headers
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    headers.set("Cross-Origin-Opener-Policy", "same-origin");
    headers.set("Cross-Origin-Resource-Policy", "same-origin");
    headers.set("Cross-Origin-Embedder-Policy", "require-corp");

    // Log security headers application
    logger.info("Security headers applied", {
      url: req.url,
      headers: Object.fromEntries(headers.entries()),
    });

    // Create response with headers
    const response = NextResponse.next();
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    logger.error("Error applying security headers", error as Error, {
      url: req.url,
    });
    return NextResponse.next();
  }
}

// SQL Injection prevention
export function sanitizeSQL(value: string): string {
  // Remove common SQL injection patterns
  return value
    .replace(/['";\\]/g, "")
    .replace(/--/g, "")
    .replace(/\bdrop\b/gi, "")
    .replace(/\bdelete\b/gi, "")
    .replace(/\bupdate\b/gi, "")
    .replace(/\binsert\b/gi, "")
    .replace(/\bselect\b/gi, "")
    .replace(/\bunion\b/gi, "")
    .trim();
}

// XSS prevention
export function sanitizeHTML(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// File type validation
export function isAllowedFileType(
  filename: string,
  allowedTypes: string[] = ["jpg", "jpeg", "png", "pdf", "doc", "docx"]
): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

// Token validation
export function validateToken(token: string): boolean {
  // Check if token matches expected format (e.g., JWT)
  const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtPattern.test(token);
}

// Password strength validation
export function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

// Rate limiting by IP and endpoint
export function getRateLimitKey(req: Request): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const url = new URL(req.url);
  return `${ip}:${url.pathname}:${req.method}`;
}

// Request validation
export function validateRequestHeaders(req: Request): boolean {
  const contentType = req.headers.get("content-type");
  const acceptHeader = req.headers.get("accept");
  const origin = req.headers.get("origin");

  // Validate content type for POST/PUT requests
  if (["POST", "PUT"].includes(req.method)) {
    if (!contentType?.includes("application/json")) {
      return false;
    }
  }

  // Validate accept header
  if (!acceptHeader) {
    return false;
  }

  // Validate origin for CORS
  if (origin && !isAllowedOrigin(origin)) {
    return false;
  }

  return true;
}

// CORS origin validation
function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://ifreelancer.com",
    // Add your production domains
  ];
  return allowedOrigins.includes(origin);
}
