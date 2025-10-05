// src/middleware.ts
// Neutral middleware to allow app to run without external Auth0.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function middleware(request: NextRequest) {
  // Delegate to the no-op auth0 wrapper to maintain compatibility
  return auth0.middleware(request);
}

// Optionally limit to routes if desired
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
