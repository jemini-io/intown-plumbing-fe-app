import { NextRequest, NextResponse } from "next/server";
import { logger } from "../logger";

const VALID_USER = {
  username: "admin",
  password: "1234",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info(body, "🔹 Login API: received body:");


    const { username, password } = body;

    if (username === VALID_USER.username && password === VALID_USER.password) {
      logger.info({ username }, "✅ Login successful for user");

      const response = NextResponse.json({ success: true });

      response.cookies.set("admin_session", "1", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    }

    logger.warn({ username, password },"❌ Invalid credentials:");
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (err) {
    logger.error(err, "💥 Error in /api/login:");
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
