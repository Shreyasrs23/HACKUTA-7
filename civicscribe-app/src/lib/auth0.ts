// src/lib/auth0.ts
// Lightweight stub to avoid external Auth0 dependency in this demo.
// Replace with real SDK integration if needed.

export class Auth0Client {
  async getSession(): Promise<null> {
    return null;
  }
}

export const auth0 = new Auth0Client();
