import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import ClientGalleryModel from "@/models/ClientGallery";
import GalleryAlbumModel from "@/models/GalleryAlbum";
import GalleryImageModel from "@/models/GalleryImage";
import { GalleryManager } from "@/components/admin/GalleryManager";

export const metadata = { title: "Manage Gallery" };
export const dynamic = "force-dynamic";

function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

async function getGalleryData(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();

  const gallery = await ClientGalleryModel.findById(id).select("-passwordHash").lean();
  if (!gallery) return null;

  const [albums, images] = await Promise.all([
    GalleryAlbumModel.find({ galleryId: id }).sort({ order: 1 }).lean(),
    GalleryImageModel.find({ galleryId: id }).sort({ order: 1 }).lean(),
  ]);

  return serialize({
    gallery: {
      ...gallery,
      _id: String(gallery._id),
      expirationDate: gallery.expirationDate ? new Date(gallery.expirationDate).toISOString() : null,
    },
    albums: albums.map((a) => ({ ...a, _id: String(a._id) })),
    images: images.map((i) => ({
      ...i,
      _id: String(i._id),
      albumId: i.albumId ? String(i.albumId) : null,
    })),
  });
}

export default async function GalleryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getGalleryData(id);
  if (!data) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">{data.gallery.name}</h1>
      <p className="mt-1 text-sm text-muted">
        {data.gallery.clientName} · /gallery/{data.gallery.slug}
      </p>
      <div className="mt-8">
        <GalleryManager gallery={data.gallery} albums={data.albums} images={data.images} />
      </div>
    </div>
  );
}
