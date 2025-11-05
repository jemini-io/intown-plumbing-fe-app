import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { AdapterUser } from "next-auth/adapters";
import pino from "pino";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserRole } from "@/app/dashboard/users/types";

const logger = pino({ name: "Auth" });

export interface UserWithRole extends AdapterUser {
  role: UserRole;
  image: string | null;
  enabled: boolean;
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          logger.warn("Missing email or password");
          return null;
        }

        logger.info({email: credentials.email}, 'Attempting login for');

        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { email: credentials.email},
          include: { image: true },
        });

        if (!user) {
          logger.info({email: credentials.email}, "User not found with");
          return null;
        }

        logger.info({email: credentials.email}, "User found");

        if (user.enabled == false) {
          logger.info({email: credentials.email, enabled: user.enabled}, "User sign-in doesn't proceed: The user is marked as NOT enabled");
          throw new Error("Your account has been temporarily disabled. Please contact the administrator.");
        }

        logger.info({
          email: user.email,
          role: user.role,
        }, 'User found for login');

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.passwordDigest);

        logger.info({isValid}, 'Password valid');

        if (!isValid) return null;

        // Return a plain object matching the expected User shape
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image ? user.image.url : null,
          enabled: user.enabled,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: { signIn: "/login?error=" },
  callbacks: {
    async jwt({
      token,
      user
    }: {
      token: JWT;
      user?: User | AdapterUser | null;
    }) {
      if (user) {
        const u = user as UserWithRole;
        token.id = u.id;
        token.role = u.role;
        token.name = u.name ?? undefined;
        token.image = u.image ?? undefined;
        token.email = u.email ?? undefined;
        token.enabled = u.enabled ?? true;
      }
      return token;
    },
    async session({
      session,
      token
    }: {
      session: Session;
      token: JWT;
    }) {
      if (!token.id) return session;
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { image: true }
        });
        if (dbUser) {
          session.user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            image: dbUser.image ? dbUser.image.url : null,
            enabled: dbUser.enabled,
          };
        }
      } catch (e) {
        logger.error({ e }, "session callback user fetch failed");
        // fallback to what's in token
        session.user = {
          ...session.user,
          id: (token.id as string) || "",
          role: (token.role as UserRole) || "USER",
          name: token.name ?? null,
          image: (token.image as string) || null,
          enabled: token.enabled ?? true,
        };
      }
      return session;
    },
  },
} //satisfies Parameters<typeof NextAuth>[0];