import { NextRequest, NextResponse } from "next/server";
import { logger } from "../logger";
import { verifyPassword } from "@/lib/auth/password"
import { prisma } from "@/lib/prisma";


// const VALID_USER = {
//   username: "admin",
//   password: "1234",
// };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info(body, "🔹 Login API: received body:");


    const { username, password } = body;

    const user = await prisma.user.findUnique({ where: { email: username } });

    if (!user) {
      logger.warn({ username }, "❌ User not found");
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordDigest);
    if (!isValid) {
      logger.warn({ username }, "❌ Invalid password");
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    logger.info({ username }, "✅ Login successful for user");
    
    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_session", "1", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
    
  } catch (err) {
    logger.error(err, "💥 Error in /api/login:");
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
