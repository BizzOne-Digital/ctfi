import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({ user: session });
}
