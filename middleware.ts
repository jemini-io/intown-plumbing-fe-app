import { NextRequest, NextResponse } from 'next/server';
import { iframeSecurityMiddleware } from './lib/middleware/iframe-security';

export function middleware(request: NextRequest) {
  const securityResponse = iframeSecurityMiddleware(request);
  if (securityResponse) return securityResponse;

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session");
    const session = sessionCookie?.value ?? "";
    console.log(`session: ${session}`)
    if (session !== "1") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/video-consultation-form/:path*',
    '/api/create-payment-intent/:path*',
    "/admin/:path*",
  ],
}; 