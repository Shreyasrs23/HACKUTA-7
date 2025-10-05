/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: true,
  },
  env: {
    // Server-side (optional)
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,

    // Client-side (Auth0 SPA) - prefer NEXT_PUBLIC_ but fall back to VITE_ or server vars
    NEXT_PUBLIC_AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN || process.env.AUTH0_DOMAIN,
    NEXT_PUBLIC_AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || process.env.VITE_AUTH0_CLIENT_ID || process.env.AUTH0_CLIENT_ID,
    NEXT_PUBLIC_AUTH0_AUDIENCE: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || process.env.VITE_AUTH0_AUDIENCE || process.env.AUTH0_AUDIENCE,
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || process.env.VITE_API_BASE || "http://localhost:8000",
  },
};

export default nextConfig;