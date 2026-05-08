import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during production builds (useful for Vercel build failures)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
