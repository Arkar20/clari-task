/** @type {import('next').NextConfig} */
const withImages = require('next-images')

const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = withImages({
    ...nextConfig,
    webpack(config, options) {
        return config
    },

});
