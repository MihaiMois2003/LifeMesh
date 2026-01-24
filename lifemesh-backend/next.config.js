/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ disables ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ disables TS errors during build
  },
};

module.exports = nextConfig;
