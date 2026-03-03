/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Allow static HTML in public/ to coexist with API routes
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
    ];
  },
};

export default nextConfig;
