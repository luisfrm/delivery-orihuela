import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Disable image optimization globally to prevent exceeding Vercel limits
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'efgavrzalsblgulsoifl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
