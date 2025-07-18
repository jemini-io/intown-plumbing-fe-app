import { NextRequest, NextResponse } from 'next/server';
import { iframeSecurityMiddleware } from './lib/middleware/iframe-security';

export function middleware(request: NextRequest) {
  const securityResponse = iframeSecurityMiddleware(request);
  if (securityResponse) return securityResponse;
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/video-consultation-form/:path*',
    '/api/create-payment-intent/:path*',
  ],
}; 