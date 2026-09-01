import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, verifyAdminSessionToken } from "@/lib/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_ADMIN_API_PATHS = ["/api/admin/auth/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAdminApi =
    pathname.startsWith("/api/admin") && !PUBLIC_ADMIN_API_PATHS.some((p) => pathname.startsWith(p));

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get(adminCookieName())?.value;
  const session = token ? await verifyAdminSessionToken(token) : null;

  if (!session) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized. Please sign in again." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
