import type { NextConfig } from "next";
// Forcing a server restart to reload the Prisma Client

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eaamruuepyfuiyyiazgy.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
