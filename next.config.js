/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server components can use Node.js APIs
  experimental: {
    serverComponentsExternalPackages: ['playwright', 'nunjucks'],
  },
}

module.exports = nextConfig
