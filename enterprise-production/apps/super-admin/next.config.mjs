/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['d123456789abcdef.cloudfront.net', 'images.unsplash.com'],
  },
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/:path*',
      },
      {
        source: '/api/v1/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:4000/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
