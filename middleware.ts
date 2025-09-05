import { NextRequest, NextResponse } from "next/server";
import { iframeSecurityMiddleware } from "./lib/middleware/iframe-security";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Apply iframe security first
  const securityResponse = iframeSecurityMiddleware(request);
  if (securityResponse) return securityResponse;

  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Get NextAuth JWT token from request
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    const allowedRoles = ["ADMIN", "USER"];

    // If no token or role is not allowed, redirect to login
    if (!token || !allowedRoles.includes(token.role as string)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware only to specific paths
export const config = {
  matcher: [
    "/video-consultation-form/:path*",
    "/api/create-payment-intent/:path*",
    "/dashboard",
    "/dashboard/:path*",
  ],
};