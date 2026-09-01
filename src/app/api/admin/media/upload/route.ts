import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import MediaModel, { type MediaFolder } from "@/models/Media";
import { uploadBuffer } from "@/lib/gridfs";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/validation";

const ALLOWED_FOLDERS: MediaFolder[] = ["logo", "favicon", "hero", "services", "gallery", "og", "general"];

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    const form = await req.formData();
    const file = form.get("file");
    const folderRaw = String(form.get("folder") ?? "general");
    const folder: MediaFolder = ALLOWED_FOLDERS.includes(folderRaw as MediaFolder)
      ? (folderRaw as MediaFolder)
      : "general";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was provided." }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a JPEG, PNG, WEBP, or GIF image." },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File is too large. The maximum size is ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "That file appears to be empty." }, { status: 400 });
    }

    await connectToDatabase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const gridfsId = await uploadBuffer(buffer, file.name, file.type);

    const media = await MediaModel.create({
      filename: file.name,
      contentType: file.type,
      size: file.size,
      gridfsId,
      folder,
    });

    return NextResponse.json({
      media: {
        id: String(media._id),
        filename: media.filename,
        contentType: media.contentType,
        size: media.size,
        folder: media.folder,
        url: `/api/media/${media._id}`,
      },
    });
  } catch (err) {
    console.error("Media upload failed", err);
    return NextResponse.json(
      { error: "Upload failed. Please check your connection and try again." },
      { status: 500 }
    );
  }
}
