import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/auth/signin") ||
      req.nextUrl.pathname.startsWith("/auth/signup");

    // If on auth page and already authenticated, redirect to dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If trying to access protected routes without auth, redirect to signin
    if (!isAuth && req.nextUrl.pathname.startsWith("/dashboard")) {
      const from = req.nextUrl.pathname + (req.nextUrl.search || "");
      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Handle role-based access for protected routes
    if (isAuth && req.nextUrl.pathname.startsWith("/dashboard")) {
      if (
        req.nextUrl.pathname.startsWith("/dashboard/my-jobs") &&
        token.role !== "CLIENT"
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (
        req.nextUrl.pathname.startsWith("/dashboard/my-applications") &&
        token.role !== "FREELANCER"
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access to auth pages without a token
        // For other routes, require a valid token
        return true;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/signin", "/auth/signup"],
};
