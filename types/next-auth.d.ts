import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/app/dashboard/users/types";
declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    image: string | null;
    name: string | null;
    email: string | null;
    enabled: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      name: string | null;
      email: string | null;
      image: string | null;
      enabled: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    enabled?: boolean;
  }
}