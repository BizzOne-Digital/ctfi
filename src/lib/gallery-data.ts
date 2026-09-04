import { cookies } from "next/headers";
import { connectToDatabase } from "./db";
import ClientGalleryModel from "@/models/ClientGallery";
import GalleryAlbumModel from "@/models/GalleryAlbum";
import GalleryImageModel from "@/models/GalleryImage";
import { galleryCookieName, verifyGallerySessionToken } from "./auth";

function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export type GalleryViewResult =
  | { status: "not_found" }
  | { status: "unauthorized"; slug: string }
  | {
      status: "ok";
      gallery: {
        name: string;
        slug: string;
        clientName: string;
        description?: string;
        allowDownloads: boolean;
        passwordProtected: boolean;
      };
      albums: { _id: string; name: string; description?: string }[];
      images: { _id: string; albumId: string | null; mediaId: string; caption?: string }[];
    };

export async function getGalleryForViewer(slug: string): Promise<GalleryViewResult> {
  try {
    await connectToDatabase();
    const gallery = await ClientGalleryModel.findOne({ slug: slug.toLowerCase() }).lean();

    if (!gallery || !gallery.active) return { status: "not_found" };
    if (gallery.expirationDate && new Date(gallery.expirationDate).getTime() < Date.now()) {
      return { status: "not_found" };
    }

    // Public (non-password-protected) galleries skip the login/session check
    // entirely — anyone with the link can view them.
    if (gallery.passwordProtected) {
      const cookieStore = await cookies();
      const token = cookieStore.get(galleryCookieName(String(gallery._id)))?.value;
      const session = token ? await verifyGallerySessionToken(token) : null;

      if (!session || session.galleryId !== String(gallery._id)) {
        return { status: "unauthorized", slug: gallery.slug };
      }
    }

    const [albums, images] = await Promise.all([
      GalleryAlbumModel.find({ galleryId: gallery._id }).sort({ order: 1 }).lean(),
      GalleryImageModel.find({ galleryId: gallery._id }).sort({ order: 1 }).lean(),
    ]);

    return serialize({
      status: "ok",
      gallery: {
        name: gallery.name,
        slug: gallery.slug,
        clientName: gallery.clientName,
        description: gallery.description,
        allowDownloads: gallery.allowDownloads,
        passwordProtected: gallery.passwordProtected,
      },
      albums: albums.map((a) => ({
        _id: String(a._id),
        name: a.name,
        description: a.description,
      })),
      images: images.map((i) => ({
        _id: String(i._id),
        albumId: i.albumId ? String(i.albumId) : null,
        mediaId: i.mediaId,
        caption: i.caption,
      })),
    });
  } catch (err) {
    console.error("Gallery view lookup failed", err);
    return { status: "not_found" };
  }
}

export interface PublicGalleryListing {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImageMediaId?: string;
}

/**
 * Active, non-expired galleries the admin has left un-password-protected —
 * shown on the public gallery landing page so visitors can browse them
 * without needing a login link. Password-protected client galleries never
 * appear here.
 */
export async function getPublicGalleries(): Promise<PublicGalleryListing[]> {
  try {
    await connectToDatabase();
    const galleries = await ClientGalleryModel.find({
      active: true,
      passwordProtected: false,
      $or: [{ expirationDate: null }, { expirationDate: { $gte: new Date() } }],
    })
      .sort({ createdAt: -1 })
      .select("name slug description coverImageMediaId")
      .lean();

    return serialize(
      galleries.map((g) => ({
        _id: String(g._id),
        name: g.name,
        slug: g.slug,
        description: g.description,
        coverImageMediaId: g.coverImageMediaId,
      }))
    );
  } catch (err) {
    console.error("Public gallery list failed", err);
    return [];
  }
}
