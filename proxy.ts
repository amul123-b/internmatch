import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    const isOnboarded = token?.isOnboarded === true;

    // ✅ PUBLIC ROUTES (DO NOT TOUCH UI)
    if (
      pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/api/auth")
    ) {
      return NextResponse.next();
    }

    // 🧠 IMPORTANT FIX → Don't redirect while session is loading
    if (!token) {
      return NextResponse.next();
    }

    // 🚀 ONBOARDING CHECK
    if (pathname.startsWith("/onboarding")) {
      if (isOnboarded) {
        return NextResponse.redirect(new URL("/internships", req.url));
      }
      return NextResponse.next();
    }

    // 🔒 PROTECTED ROUTES
    const protectedRoutes = ["/internships", "/apply", "/dashboard"];

    const isProtected = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtected && !isOnboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};