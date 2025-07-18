module.exports = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media1.giphy.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/video-consultation-form',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://js.stripe.com",
              "frame-src 'self' https://js.stripe.com",
              "frame-ancestors 'self' " + (process.env.ALLOWED_IFRAME_ORIGINS || ''),
              "connect-src 'self' https://api.stripe.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};