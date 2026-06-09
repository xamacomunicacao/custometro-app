import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'better-sqlite3', '@prisma/adapter-better-sqlite3'],
  images: {
    remotePatterns: [
      { hostname: 'www.senado.leg.br' },
      { hostname: 'www.camara.leg.br' },
      { hostname: 'www.aleam.gov.br' },
      { hostname: 'cmm.am.gov.br' },
      { hostname: 'ui-avatars.com' },
    ],
  },
};

export default nextConfig;
