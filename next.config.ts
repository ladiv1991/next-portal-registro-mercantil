import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Compress response bodies (gzip + brotli)
  compress: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Optimize package imports (tree-shake unused exports)
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
