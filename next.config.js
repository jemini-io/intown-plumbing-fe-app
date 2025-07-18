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
    const allowedOrigins = process.env.ALLOWED_IFRAME_ORIGINS?.split(',') || [];
    const frameAncestors = ['self', ...allowedOrigins].filter(Boolean).join(' ');

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
              `frame-ancestors ${frameAncestors}`,
              "connect-src 'self' https://api.stripe.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};