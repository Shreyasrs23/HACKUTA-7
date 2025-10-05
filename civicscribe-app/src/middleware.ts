// src/middleware.ts
// Neutral middleware to allow app to run without external Auth0.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

// Optionally limit to routes if desired
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
