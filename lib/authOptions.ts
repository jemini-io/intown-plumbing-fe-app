import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { AdapterUser } from "next-auth/adapters";
import pino from "pino";

const logger = pino({ name: "Auth" });

export interface UserWithRole extends AdapterUser {
  role: "USER" | "ADMIN";
  image: string | null;
}

export const authOptions: NextAuthOptions = {
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

        logger.info(credentials.email, 'Attempting login for email');

        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { image: true },
        });

        if (!user) {
          logger.info(credentials.email, "User not found");
          return null;
        }

        logger.info(user, 'User found');

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.passwordDigest);

        logger.info(isValid, 'Password valid');

        if (!isValid) return null;

        // Return a plain object matching the expected User shape
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image ? user.image.url : null,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login?error=" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as UserWithRole;
        token.role = u.role;
        token.name = u.name;
        // If user.image is an object, get the URL
        token.image = typeof u.image === "object" && u.image !== null ? u.image.url : u.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          role: token.role,
          name: token.name,
          image: token.image,
        } as typeof session.user & { role: string; name?: string; image?: string };
      }
      return session;
    },
  },
};