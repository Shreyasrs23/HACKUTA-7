// src/middleware.ts
// Neutral middleware to allow app to run without external Auth0.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Redirect any legacy Auth0 routes to our local auth pages
  if (pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  if (pathname.startsWith("/auth/signup") || pathname.startsWith("/auth/register")) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }
  return NextResponse.next();
}

// Optionally limit to routes if desired
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
