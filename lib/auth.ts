import { auth } from "@/auth"; // from your NextAuth setup (v5)

export async function requireAdmin() {
  if (process.env.NODE_ENV === "development") {
    return { user: { role: "ADMIN" } }; // Skip validation in development
  }
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}