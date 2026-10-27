import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  compress: true,

  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    // CSP: dev needs 'unsafe-inline' + 'unsafe-eval' for Turbopack/React dev features.
    // Production uses nonce-based (set in middleware.ts) — this static header is fallback-only.
    const cspValue = isDev
      ? "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; connect-src 'self';"
      : "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; connect-src 'self';";
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: cspValue },
        ],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "framer-motion",
    ],
  },
};

export default nextConfig;
