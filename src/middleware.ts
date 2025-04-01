import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/auth/signin" ||
    path === "/auth/signup" ||
    path === "/jobs" ||
    path.startsWith("/api/auth") ||
    (path.startsWith("/api/jobs") && !path.includes("/api/jobs/user"));

  // Check for authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect logic
  const isAuthPath = path.startsWith("/auth");

  // If user is on auth page but already authenticated, redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is trying to access protected route without auth, redirect to signin
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Apply to all paths except static files, api routes needed for auth
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)",
  ],
};
