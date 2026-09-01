import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import ContactMessageModel from "@/models/ContactMessage";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("q")?.trim();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const messages = await ContactMessageModel.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ messages: messages.map((m) => ({ ...m, _id: String(m._id) })) });
  } catch (err) {
    console.error("Message list failed", err);
    return NextResponse.json({ error: "Unable to load messages right now." }, { status: 503 });
  }
}
