import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import ClientGalleryModel from "@/models/ClientGallery";
import GalleryAlbumModel from "@/models/GalleryAlbum";
import GalleryImageModel from "@/models/GalleryImage";
import MediaModel from "@/models/Media";
import { deleteFile } from "@/lib/gridfs";
import { gallerySchema } from "@/lib/validation";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    await connectToDatabase();
    const gallery = await ClientGalleryModel.findById(id).select("-passwordHash").lean();
    if (!gallery) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

    const [albums, images] = await Promise.all([
      GalleryAlbumModel.find({ galleryId: id }).sort({ order: 1 }).lean(),
      GalleryImageModel.find({ galleryId: id }).sort({ order: 1 }).lean(),
    ]);

    return NextResponse.json({
      gallery: { ...gallery, _id: String(gallery._id) },
      albums: albums.map((a) => ({ ...a, _id: String(a._id), galleryId: String(a.galleryId) })),
      images: images.map((i) => ({
        ...i,
        _id: String(i._id),
        galleryId: String(i.galleryId),
        albumId: i.albumId ? String(i.albumId) : null,
      })),
    });
  } catch (err) {
    console.error("Gallery fetch failed", err);
    return NextResponse.json({ error: "Unable to load the gallery right now." }, { status: 503 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = gallerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const conflict = await ClientGalleryModel.findOne({ slug: parsed.data.slug, _id: { $ne: id } });
    if (conflict) {
      return NextResponse.json(
        { error: "A gallery with that slug already exists. Please choose a different one." },
        { status: 409 }
      );
    }

    const isProtected = parsed.data.passwordProtected !== false;
    const { password, ...rest } = parsed.data;
    const update: Record<string, unknown> = {
      ...rest,
      passwordProtected: isProtected,
      expirationDate: parsed.data.expirationDate ? new Date(parsed.data.expirationDate) : null,
    };

    if (isProtected) {
      if (password) {
        update.passwordHash = await bcrypt.hash(password, 12);
      } else {
        const current = await ClientGalleryModel.findById(id).select("passwordHash").lean();
        if (!current?.passwordHash) {
          return NextResponse.json(
            { error: "Please set a password to make this gallery password-protected." },
            { status: 400 }
          );
        }
      }
    } else {
      // Making a gallery public — clear any stored password hash so there is
      // nothing sensitive left on a gallery anyone with the link can open.
      update.passwordHash = "";
    }

    const gallery = await ClientGalleryModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .select("-passwordHash")
      .lean();

    if (!gallery) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
    return NextResponse.json({ gallery: { ...gallery, _id: String(gallery._id) } });
  } catch (err) {
    console.error("Gallery update failed", err);
    return NextResponse.json({ error: "Unable to update the gallery right now." }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    await connectToDatabase();

    const gallery = await ClientGalleryModel.findById(id);
    if (!gallery) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

    // Clean up every image's bytes from GridFS, then the metadata records.
    const images = await GalleryImageModel.find({ galleryId: id }).lean();
    for (const image of images) {
      const media = await MediaModel.findById(image.mediaId);
      if (media) {
        await deleteFile(media.gridfsId);
        await media.deleteOne();
      }
    }
    await GalleryImageModel.deleteMany({ galleryId: id });
    await GalleryAlbumModel.deleteMany({ galleryId: id });
    await gallery.deleteOne();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gallery delete failed", err);
    return NextResponse.json({ error: "Unable to delete the gallery right now." }, { status: 503 });
  }
}
