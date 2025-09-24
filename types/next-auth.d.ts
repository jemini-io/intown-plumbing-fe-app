import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string | null;
    image?: string | null;
    name?: string | null;
    email?: string | null;
  }

  interface Session {
    user?: (DefaultSession["user"] & { role?: string | null }) | null;
    // Note: we don't redefine `expires`; it stays from DefaultSession
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
    name?: string | null;
    image?: string | null;
  }
}