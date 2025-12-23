import { NextRequest, NextResponse } from "next/server";
import { iframeSecurityMiddleware } from "./lib/middleware/iframe-security";
import { getToken } from "next-auth/jwt";
import { adminOnlyRoutes } from "./app/dashboard/components/navItemsData";
import pino from "pino";

const logger = pino({ name: "middleware" });

export async function middleware(request: NextRequest) {
  const prompt = 'middleware function says:';
  logger.info({prompt}, 'Starting...');
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

  if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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