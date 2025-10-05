// src/lib/auth0.ts
// Wrapper that prefers real Auth0 server SDK if installed, else uses no-op shim.

// The path alias in tsconfig points '@auth0/nextjs-auth0/server' to our shim
// so importing from it will work locally without the dependency.
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  audience: process.env.AUTH0_AUDIENCE,
});
