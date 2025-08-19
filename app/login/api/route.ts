import { NextRequest, NextResponse } from 'next/server';

const VALID_USER = {
  username: "admin",
  password: "1234",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (username === VALID_USER.username && password === VALID_USER.password) {
    const response = NextResponse.json({ 
        success: true,
    });

    response.cookies.set({
      name: "admin_session",
      value: "1",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
