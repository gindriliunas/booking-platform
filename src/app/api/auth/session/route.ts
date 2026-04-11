import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/auth-constants";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

    const sessionCookie = await createSession(idToken);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 14, // 14 days in seconds
    });
    return res;
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
