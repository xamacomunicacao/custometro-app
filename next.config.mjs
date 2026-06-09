/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during Vercel builds since we just want to deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TS type errors during Vercel builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
