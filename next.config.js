/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@0xgasless/agent-sdk', 'ethers', '@tavily/core'],
  },
};

module.exports = nextConfig;
