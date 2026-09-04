import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import MediaModel from "@/models/Media";
import GalleryImageModel from "@/models/GalleryImage";
import ClientGalleryModel from "@/models/ClientGallery";
import { downloadToBuffer } from "@/lib/gridfs";
import { galleryCookieName, verifyGallerySessionToken } from "@/lib/auth";
import { verifyAdminRequest } from "@/lib/admin-guard";

/**
 * Serves a Media document's bytes.
 *
 * Public folders (logo/favicon/hero/services/og/general) are served openly —
 * they are meant to appear on the public site. Media that belongs to a
 * gallery marked password-protected is only served if the request carries a
 * valid, unexpired session cookie scoped to that exact gallery, or a valid
 * admin session — this is what stops someone from guessing a media id in the
 * URL and pulling a private client's photos directly. Media in a gallery the
 * admin has left public (passwordProtected: false) is served openly, same as
 * any other public-site image.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    await connectToDatabase();
    const media = await MediaModel.findById(id).lean();
    if (!media) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    let isPrivateGalleryPhoto = false;

    if (media.folder === "gallery") {
      const isAdmin = await verifyAdminRequest(req);
      if (!isAdmin) {
        const galleryImage = await GalleryImageModel.findOne({ mediaId: id }).lean();
        if (!galleryImage) {
          return NextResponse.json({ error: "Not found." }, { status: 404 });
        }
        const gallery = await ClientGalleryModel.findById(galleryImage.galleryId).lean();
        if (!gallery || !gallery.active) {
          return NextResponse.json({ error: "Not found." }, { status: 404 });
        }
        if (gallery.passwordProtected) {
          isPrivateGalleryPhoto = true;
          const cookie = req.cookies.get(galleryCookieName(String(gallery._id)))?.value;
          const session = cookie ? await verifyGallerySessionToken(cookie) : null;
          if (!session || session.galleryId !== String(gallery._id)) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
          }
        }
      }
    }

    const buffer = await downloadToBuffer(media.gridfsId);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": media.contentType,
        "Content-Length": String(media.size),
        "Cache-Control": isPrivateGalleryPhoto ? "private, no-store" : "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    console.error("Media fetch failed", err);
    return NextResponse.json({ error: "Unable to load media right now." }, { status: 503 });
  }
}
