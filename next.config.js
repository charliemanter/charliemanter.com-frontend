// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.scdn.co', 'img.youtube.com', 'lh3.googleusercontent.com'], // allow Spotify album art
  },
};

module.exports = nextConfig;