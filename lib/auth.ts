import { auth } from "@/auth"; // from your NextAuth setup (v5)

export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized"); // or redirect("/login")
  }
  return session;
}
