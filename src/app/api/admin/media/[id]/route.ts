import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import MediaModel from "@/models/Media";
import { deleteFile } from "@/lib/gridfs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid media id." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const media = await MediaModel.findById(id);
    if (!media) {
      return NextResponse.json({ error: "Media not found." }, { status: 404 });
    }
    await deleteFile(media.gridfsId);
    await media.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Media delete failed", err);
    return NextResponse.json({ error: "Unable to delete media right now." }, { status: 503 });
  }
}
