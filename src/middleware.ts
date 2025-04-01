import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/auth/signin") ||
      req.nextUrl.pathname.startsWith("/auth/signup");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Handle role-based access
    if (req.nextUrl.pathname.startsWith("/dashboard/my-jobs")) {
      if (token.role !== "CLIENT") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    if (req.nextUrl.pathname.startsWith("/dashboard/my-applications")) {
      if (token.role !== "FREELANCER") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/signin",
    "/auth/signup",
    "/jobs/:path*",
  ],
};
