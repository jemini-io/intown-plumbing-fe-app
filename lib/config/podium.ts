export const PODIUM_CONFIG = {
  tokenUrl: 'https://accounts.podium.com/oauth/token',
  baseUrl: 'https://api.podium.com/v4',
  clientId: process.env.PODIUM_CLIENT_ID!,
  clientSecret: process.env.PODIUM_CLIENT_SECRET!,
  refreshToken: process.env.PODIUM_REFRESH_TOKEN!,
  redirectUri: process.env.PODIUM_REDIRECT_URI!,
}

// Validate required environment variables
if (!PODIUM_CONFIG.clientId || !PODIUM_CONFIG.clientSecret || !PODIUM_CONFIG.refreshToken) {
  throw new Error('PODIUM_CLIENT_ID, PODIUM_CLIENT_SECRET, and PODIUM_REFRESH_TOKEN must be set in environment variables')
}
