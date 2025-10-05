// Minimal shim for '@auth0/nextjs-auth0/server' to unblock local builds.
// If you decide to integrate Auth0, replace this file with real SDK usage
// and remove the tsconfig path alias.

export class Auth0Client {
  constructor(opts?: any) {}
  async getSession() {
    return null;
  }
}

export function getSession() {
  return null;
}
