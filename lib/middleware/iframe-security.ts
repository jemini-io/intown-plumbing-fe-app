import { NextRequest, NextResponse } from 'next/server';

export function validateIframeOrigin(req: NextRequest): boolean {
  const allowedOrigins = process.env.ALLOWED_IFRAME_ORIGINS?.split(',') || [];
  const origin = req.headers.get('origin') || req.headers.get('referer');
  
  // Allow direct browser access (no origin/referer header)
  if (!origin) {
    return true;
  }
  
  // Allow same-origin requests (navigation within the same domain)
  const requestHost = req.nextUrl.host;
  const refererUrl = new URL(origin);
  if (refererUrl.host === requestHost) {
    return true;
  }
  
  // Validate origin for cross-origin iframe requests
  const isValid = allowedOrigins.some(allowedOrigin => origin.includes(allowedOrigin.trim()));
  return isValid;
}

export function iframeSecurityMiddleware(req: NextRequest): NextResponse | null {
  if (!req.nextUrl.pathname.startsWith('/video-consultation-form') && !req.nextUrl.pathname.startsWith('/api/create-payment-intent')) {
    return null;
  }
  
  if (!validateIframeOrigin(req)) {
    console.log('❌ Iframe security middleware: Access denied - returning 403');
    return new NextResponse('Forbidden', { status: 403 });
  }
  return null;
} 