import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import GalleryAlbumModel from "@/models/GalleryAlbum";
import GalleryImageModel from "@/models/GalleryImage";
import { albumSchema } from "@/lib/validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; albumId: string }> }
) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id, albumId } = await params;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(albumId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

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
    const album = await GalleryAlbumModel.findOneAndUpdate({ _id: albumId, galleryId: id }, parsed.data, {
      new: true,
    }).lean();
    if (!album) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    return NextResponse.json({ album: { ...album, _id: String(album._id), galleryId: String(album.galleryId) } });
  } catch (err) {
    console.error("Album update failed", err);
    return NextResponse.json({ error: "Unable to update the album right now." }, { status: 503 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; albumId: string }> }
) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id, albumId } = await params;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(albumId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const album = await GalleryAlbumModel.findOneAndDelete({ _id: albumId, galleryId: id });
    if (!album) return NextResponse.json({ error: "Album not found." }, { status: 404 });

    // Images in the deleted album become "unsorted" rather than being deleted.
    await GalleryImageModel.updateMany({ galleryId: id, albumId }, { albumId: null });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Album delete failed", err);
    return NextResponse.json({ error: "Unable to delete the album right now." }, { status: 503 });
  }
}
