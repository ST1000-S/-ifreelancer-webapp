import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimitMiddleware } from "@/lib/rate-limit";
import { edgeLogger } from "@/lib/edge-logger";

// Define paths that should be public (not rate limited)
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/api/auth/callback",
  "/api/auth/providers",
  "/api/auth/csrf",
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/session",
];

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log incoming request
  edgeLogger.debug("Middleware processing request", {
    path: pathname,
    method: request.method,
    ip: request.ip,
    headers: Object.fromEntries(request.headers.entries()),
  });

  // Skip rate limiting for public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    edgeLogger.debug("Skipping rate limit for public path", { path: pathname });
    return NextResponse.next();
  }

  // Apply rate limiting for API routes
  if (pathname.startsWith("/api")) {
    try {
      edgeLogger.debug("Applying rate limit middleware", { path: pathname });
      const response = await rateLimitMiddleware(request);

      // If rate limit is exceeded, return the 429 response
      if (response.status === 429) {
        edgeLogger.debug("Rate limit exceeded", {
          path: pathname,
          headers: Object.fromEntries(response.headers.entries()),
        });
        return new NextResponse(
          JSON.stringify({ error: "Too Many Requests" }),
          {
            status: 429,
            headers: response.headers,
          }
        );
      }

      // Get the original response
      const originalResponse = await NextResponse.next();

      // Copy rate limit headers to the response
      response.headers.forEach((value, key) => {
        if (key.toLowerCase().startsWith("x-ratelimit")) {
          originalResponse.headers.set(key, value);
        }
      });

      edgeLogger.debug("Rate limit middleware completed", {
        path: pathname,
        status: originalResponse.status,
        headers: Object.fromEntries(originalResponse.headers.entries()),
      });

      return originalResponse;
    } catch (error) {
      edgeLogger.error(
        "Rate limit middleware error",
        error instanceof Error ? error : new Error(String(error))
      );

      // On error, continue without rate limiting
      return NextResponse.next();
    }
  }

  // For all other routes, continue without rate limiting
  return NextResponse.next();
}
