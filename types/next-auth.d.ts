import type { DefaultSession } from "next-auth";

export type Role = "USER" | "ADMIN";
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    image: string | null;
    name: string | null;
    email: string | null;
    enabled: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
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
    role?: Role;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    enabled?: boolean;
  }
}