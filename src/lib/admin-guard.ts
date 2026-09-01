import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSessionToken, type AdminSessionPayload } from "./auth";

/** Server Component variant: reads the session cookie via next/headers. */
export async function getAdminSessionFromCookies(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

/** True if the request carries a valid admin session cookie. */
export async function verifyAdminRequest(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(adminCookieName())?.value;
  if (!token) return false;
  const payload = await verifyAdminSessionToken(token);
  return Boolean(payload);
}

/** Returns the admin session payload, or null if unauthenticated. */
export async function getAdminSession(req: NextRequest): Promise<AdminSessionPayload | null> {
  const token = req.cookies.get(adminCookieName())?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

/**
 * Use at the top of every /api/admin/** route:
 *   const guard = await requireAdmin(req);
 *   if (guard) return guard;
 * Returns a 401 NextResponse if unauthenticated, otherwise null (proceed).
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Please sign in again." }, { status: 401 });
  }
  return null;
}
