import { NextResponse } from "next/server";
import { logger as Logger } from "./logger-impl";

const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

function getCSPHeader(): string {
  const trustedDomains =
    process.env.NEXT_PUBLIC_TRUSTED_DOMAINS?.split(",") || [];
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    `connect-src 'self' ${trustedDomains.join(" ")}`,
    "frame-ancestors 'none'",
  ].join("; ");
}

export function securityMiddleware(request: Request): NextResponse {
  const response = NextResponse.next();

  // Set security headers
  const headers = new Headers(response.headers);
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Validate request headers
  if (!validateRequestHeaders(request.headers)) {
    return NextResponse.json(
      { error: "Invalid request headers" },
      { status: 400, headers }
    );
  }

  return NextResponse.next({
    headers,
  });
}

export function sanitizeSQL(input: string): string {
  // Remove SQL keywords
  const sqlKeywords = [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "UNION",
    "WHERE",
    "FROM",
  ];
  let sanitized = input;
  sqlKeywords.forEach((keyword) => {
    sanitized = sanitized.replace(new RegExp(keyword, "gi"), "");
  });

  // Escape single quotes and remove comments
  sanitized = sanitized
    .replace(/'/g, "''")
    .replace(/--/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove other potentially dangerous characters
  sanitized = sanitized.replace(/[;\\]/g, "");

  return sanitized;
}

export function sanitizeHTML(input: string): string {
  const htmlMap: { [key: string]: string } = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return input.replace(/[<>&"']/g, (char) => htmlMap[char]);
}

export function isAllowedFileType(filename: string): boolean {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];
  const ext = filename.toLowerCase().match(/\.[^.]*$/)?.[0];
  return ext ? allowedExtensions.includes(ext) : false;
}

export function validateToken(token: string): boolean {
  // JWT format: header.payload.signature
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  // Check if each part is base64url encoded
  const base64UrlRegex = /^[A-Za-z0-9-_]+$/;
  return parts.every((part) => base64UrlRegex.test(part));
}

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function getRateLimitKey(request: Request): string {
  try {
    const url = new URL(request.url);
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    return `${ip}:${url.pathname}:${request.method}`;
  } catch (error) {
    Logger.error("Error generating rate limit key", error);
    return "error:key:generation";
  }
}

export function generateRateLimitKey(ip: string, url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `${ip}:${parsedUrl.pathname}`;
  } catch (error) {
    Logger.error("Error generating rate limit key:", error);
    return `${ip}:error`;
  }
}

export function validateRequestHeaders(headers: Headers): boolean {
  const contentType = headers.get("content-type");
  const acceptHeader = headers.get("accept");
  const origin = headers.get("origin");

  if (!contentType || !contentType.includes("application/json")) {
    Logger.warn("Invalid content type header");
    return false;
  }

  if (!acceptHeader || !acceptHeader.includes("application/json")) {
    Logger.warn("Invalid accept header");
    return false;
  }

  if (!origin || !/^https?:\/\/[a-zA-Z0-9-.]+(:\d+)?$/.test(origin)) {
    Logger.warn("Invalid origin header");
    return false;
  }

  return true;
}
