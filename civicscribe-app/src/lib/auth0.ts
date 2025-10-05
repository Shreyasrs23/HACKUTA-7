// src/lib/auth0.ts
// No-op Auth0 wrapper used for local/demo builds.
// Provides a compatible API for middleware.ts and other call sites.

import { NextResponse } from "next/server";

export const auth0 = {
  // Neutral middleware that simply lets the request pass through
  async middleware(_req: any) {
    return NextResponse.next();
  },
  // Session getter placeholder
  async getSession() {
    return null;
  },
  // Redirect helpers emulating Auth0 SDK routes
  loginUrl() {
    return "/signin";
  },
  signupUrl() {
    return "/signup";
  },
};
