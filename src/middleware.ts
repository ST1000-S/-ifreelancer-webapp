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
    path.startsWith("/api/jobs") ||
    path.startsWith("/_next") ||
    path.includes(".") ||
    path === "/favicon.ico";

  try {
    // Check for authentication token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if path is an auth page
    const isAuthPage = path.startsWith("/auth");

    // If user is already authenticated and tries to access an auth page, redirect to dashboard
    if (token && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // For protected routes, redirect to signin if not authenticated
    if (!isPublicPath && !token) {
      const signinUrl = new URL("/auth/signin", request.url);
      signinUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signinUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // If there's an error, redirect to the error page
    const errorUrl = new URL("/auth/error", request.url);
    errorUrl.searchParams.set("error", "Configuration");
    return NextResponse.redirect(errorUrl);
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
