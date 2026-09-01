import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import GalleryAlbumModel from "@/models/GalleryAlbum";
import { albumSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid gallery id." }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = albumSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid album name." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const album = await GalleryAlbumModel.create({ ...parsed.data, galleryId: id });
    return NextResponse.json(
      { album: { ...album.toObject(), _id: String(album._id), galleryId: String(album.galleryId) } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Album create failed", err);
    return NextResponse.json({ error: "Unable to create the album right now." }, { status: 503 });
  }
}
