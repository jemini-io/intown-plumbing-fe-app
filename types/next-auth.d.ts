import type { DefaultSession } from "next-auth";

export type Role = "USER" | "ADMIN";
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    image: string | null;
    name: string | null;
    email: string | null;
  }

  // interface Session {
  //   user?: (DefaultSession["user"] & { role?: string | null }) | null;
  //   // Note: we don't redefine `expires`; it stays from DefaultSession
  // }
  interface Session {
    user: {
      id: string;
      role: Role;
      name: string | null;
      email: string | null;
      image: string | null;
    } & DefaultSession["user"];
  }
}

// declare module "next-auth/jwt" {
//   interface JWT {
//     role?: string | null;
//     name?: string | null;
//     image?: string | null;
//   }
// }

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}