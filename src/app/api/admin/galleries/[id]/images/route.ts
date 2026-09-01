import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import GalleryImageModel from "@/models/GalleryImage";
import MediaModel from "@/models/Media";
import { uploadBuffer } from "@/lib/gridfs";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid gallery id." }, { status: 400 });

  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    const albumIdRaw = form.get("albumId");
    const albumId = typeof albumIdRaw === "string" && Types.ObjectId.isValid(albumIdRaw) ? albumIdRaw : null;

    if (files.length === 0) {
      return NextResponse.json({ error: "No files were provided." }, { status: 400 });
    }

    await connectToDatabase();

    const lastImage = await GalleryImageModel.findOne({ galleryId: id }).sort({ order: -1 }).lean();
    let nextOrder = (lastImage?.order ?? -1) + 1;

    const created = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        continue; // skip unsupported files instead of failing the whole batch
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES || file.size === 0) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const gridfsId = await uploadBuffer(buffer, file.name, file.type);
      const media = await MediaModel.create({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        gridfsId,
        folder: "gallery",
      });

      const image = await GalleryImageModel.create({
        galleryId: id,
        albumId,
        mediaId: String(media._id),
        order: nextOrder++,
      });

      created.push({ ...image.toObject(), _id: String(image._id), galleryId: String(image.galleryId) });
    }

    if (created.length === 0) {
      return NextResponse.json(
        { error: "None of the files could be uploaded. Please check file type and size." },
        { status: 400 }
      );
    }

    return NextResponse.json({ images: created }, { status: 201 });
  } catch (err) {
    console.error("Gallery image upload failed", err);
    return NextResponse.json({ error: "Unable to upload images right now." }, { status: 500 });
  }
}
