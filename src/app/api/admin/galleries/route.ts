import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import ClientGalleryModel from "@/models/ClientGallery";
import { gallerySchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await connectToDatabase();
    const galleries = await ClientGalleryModel.find().sort({ createdAt: -1 }).select("-passwordHash").lean();
    return NextResponse.json({ galleries: galleries.map((g) => ({ ...g, _id: String(g._id) })) });
  } catch (err) {
    console.error("Gallery list failed", err);
    return NextResponse.json({ error: "Unable to load galleries right now." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

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

  if (!parsed.data.password) {
    return NextResponse.json({ error: "A password is required when creating a gallery." }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const existing = await ClientGalleryModel.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json(
        { error: "A gallery with that slug already exists. Please choose a different one." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const { password: _password, ...rest } = parsed.data;
    void _password;

    const gallery = await ClientGalleryModel.create({
      ...rest,
      passwordHash,
      expirationDate: parsed.data.expirationDate ? new Date(parsed.data.expirationDate) : null,
    });

    const obj = gallery.toObject();
    delete (obj as { passwordHash?: string }).passwordHash;

    return NextResponse.json({ gallery: { ...obj, _id: String(gallery._id) } }, { status: 201 });
  } catch (err) {
    console.error("Gallery create failed", err);
    return NextResponse.json({ error: "Unable to create the gallery right now." }, { status: 503 });
  }
}
