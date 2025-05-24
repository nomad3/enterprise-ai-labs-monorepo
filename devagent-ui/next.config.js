/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://devagent:8000/api/:path*', // Proxy to Backend using Docker service name
      },
    ];
  },
};

module.exports = nextConfig; 