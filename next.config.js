/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/safety/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/safety/:path*`,
      },
    ];
  },
};
