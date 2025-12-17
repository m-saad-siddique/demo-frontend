import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export for nginx hosting (no Next.js runtime server in production)
  output: 'export',
  images: {
    // next/image optimization requires a Next.js server; disable for static export
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/files/**',
      },
    ],
  },
};

export default nextConfig;


