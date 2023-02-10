const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: isProd ? '/virtualhome2kg_generation' : '',
  reactStrictMode: true,
}

module.exports = nextConfig
