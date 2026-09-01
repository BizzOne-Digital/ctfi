import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import GalleryImageModel from "@/models/GalleryImage";
import MediaModel from "@/models/Media";
import { deleteFile } from "@/lib/gridfs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id, imageId } = await params;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(imageId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if ("albumId" in b) {
    patch.albumId = b.albumId && Types.ObjectId.isValid(String(b.albumId)) ? b.albumId : null;
  }
  if (typeof b.caption === "string") patch.caption = b.caption;
  if (typeof b.order === "number") patch.order = b.order;
  if (typeof b.isCover === "boolean") patch.isCover = b.isCover;

  try {
    await connectToDatabase();

    if (patch.isCover) {
      await GalleryImageModel.updateMany({ galleryId: id }, { isCover: false });
    }

    const image = await GalleryImageModel.findOneAndUpdate({ _id: imageId, galleryId: id }, patch, {
      new: true,
    }).lean();
    if (!image) return NextResponse.json({ error: "Image not found." }, { status: 404 });

    return NextResponse.json({
      image: { ...image, _id: String(image._id), galleryId: String(image.galleryId) },
    });
  } catch (err) {
    console.error("Gallery image update failed", err);
    return NextResponse.json({ error: "Unable to update the image right now." }, { status: 503 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id, imageId } = await params;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(imageId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const image = await GalleryImageModel.findOneAndDelete({ _id: imageId, galleryId: id });
    if (!image) return NextResponse.json({ error: "Image not found." }, { status: 404 });

    const media = await MediaModel.findById(image.mediaId);
    if (media) {
      await deleteFile(media.gridfsId);
      await media.deleteOne();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gallery image delete failed", err);
    return NextResponse.json({ error: "Unable to delete the image right now." }, { status: 503 });
  }
}
