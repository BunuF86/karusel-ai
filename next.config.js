/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server components can use Node.js APIs
  experimental: {
    serverComponentsExternalPackages: ['playwright', 'nunjucks'],
  },
  // CORS headers for API routes (needed when frontend is on Vercel, API on separate server)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
