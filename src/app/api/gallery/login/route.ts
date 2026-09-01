import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import ClientGalleryModel from "@/models/ClientGallery";
import { galleryLoginSchema } from "@/lib/validation";
import { createGallerySessionToken, galleryCookieName, GALLERY_SESSION_MAX_AGE } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = galleryLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter the gallery name and password." }, { status: 400 });
  }

  const slug = parsed.data.slug.trim().toLowerCase();

  // Rate limit per IP+slug so brute-forcing one gallery's password is slow,
  // without letting one attacker lock out every gallery from a shared IP.
  const rl = checkRateLimit(`gallery-login:${ip}:${slug}`, 8, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  try {
    await connectToDatabase();
    const gallery = await ClientGalleryModel.findOne({ slug });

    // Always run a bcrypt compare (even against a dummy hash) so a missing
    // gallery and a wrong password take the same amount of time and return
    // the same generic error — this avoids leaking which gallery slugs exist.
    const dummyHash = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8O8IEbqCiVWlqoO7Jm.hbeOtNWkjW6";
    const validPassword = await bcrypt.compare(parsed.data.password, gallery?.passwordHash ?? dummyHash);

    if (!gallery || !validPassword) {
      return NextResponse.json({ error: "Incorrect gallery name or password." }, { status: 401 });
    }

    if (!gallery.active) {
      return NextResponse.json(
        { error: "This gallery is no longer active. Please contact the studio." },
        { status: 403 }
      );
    }

    if (gallery.expirationDate && gallery.expirationDate.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "This gallery has expired. Please contact the studio for access." },
        { status: 403 }
      );
    }

    let expiresInSeconds = GALLERY_SESSION_MAX_AGE;
    if (gallery.expirationDate) {
      const secondsUntilExpiry = Math.floor((gallery.expirationDate.getTime() - Date.now()) / 1000);
      expiresInSeconds = Math.max(60, Math.min(expiresInSeconds, secondsUntilExpiry));
    }

    const token = await createGallerySessionToken(String(gallery._id), expiresInSeconds);

    const res = NextResponse.json({ gallery: { slug: gallery.slug, name: gallery.name } });
    res.cookies.set(galleryCookieName(String(gallery._id)), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresInSeconds,
    });
    return res;
  } catch (err) {
    console.error("Gallery login failed", err);
    return NextResponse.json(
      { error: "We couldn't verify that right now. Please try again shortly." },
      { status: 503 }
    );
  }
}
