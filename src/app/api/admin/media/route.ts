import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import MediaModel from "@/models/Media";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");
    const search = searchParams.get("q")?.trim();

    const query: Record<string, unknown> = {};
    if (folder) query.folder = folder;
    if (search) query.filename = { $regex: search, $options: "i" };

    const docs = await MediaModel.find(query).sort({ createdAt: -1 }).limit(500).lean();

    return NextResponse.json({
      media: docs.map((m) => ({
        id: String(m._id),
        filename: m.filename,
        contentType: m.contentType,
        size: m.size,
        folder: m.folder,
        createdAt: m.createdAt,
        url: `/api/media/${m._id}`,
      })),
    });
  } catch (err) {
    console.error("Media list failed", err);
    return NextResponse.json({ error: "Unable to load media right now." }, { status: 503 });
  }
}
