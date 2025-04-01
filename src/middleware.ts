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
    path === "/auth/error" ||
    path === "/jobs" ||
    path.startsWith("/api/auth") ||
    (path.startsWith("/api/jobs") && !path.includes("/api/jobs/user"));

  // Check if path is an auth page
  const isAuthPage = path.startsWith("/auth");

  // Check for authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If user is already authenticated and tries to access an auth page, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For /profile specifically, redirect to signin if not authenticated
  if (path === "/profile" && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // For dashboard and other protected routes, redirect to signin
  if (!isPublicPath && !token) {
    // Store the original URL to redirect back after signin
    const signinUrl = new URL("/auth/signin", request.url);

    // Set the callback URL
    if (path !== "/api/auth/signin") {
      signinUrl.searchParams.set("callbackUrl", request.url);
    }

    return NextResponse.redirect(signinUrl);
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
