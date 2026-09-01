import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import AdminUserModel from "@/models/AdminUser";
import { adminLoginSchema } from "@/lib/validation";
import { createAdminSessionToken, adminCookieName, ADMIN_SESSION_MAX_AGE } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`admin-login:${ip}`, 8, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid email and password.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const user = await AdminUserModel.findOne({ email: parsed.data.email.toLowerCase() });

    // Constant-shape response whether or not the user exists, to avoid
    // leaking which admin emails are registered.
    const validPassword = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;

    if (!user || !validPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createAdminSessionToken({
      sub: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({
      user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
    });
    res.cookies.set(adminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    return res;
  } catch (err) {
    console.error("Admin login failed", err);
    return NextResponse.json(
      { error: "We couldn't reach the database. Please try again shortly." },
      { status: 503 }
    );
  }
}
