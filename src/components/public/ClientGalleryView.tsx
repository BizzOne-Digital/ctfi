"use client";

import * as React from "react";
import Image from "next/image";
import { Download, X, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { cn, mediaUrl } from "@/lib/utils";

interface GalleryImage {
  _id: string;
  albumId: string | null;
  mediaId: string;
  caption?: string;
}

interface Album {
  _id: string;
  name: string;
  description?: string;
}

export function ClientGalleryView({
  albums,
  images,
  allowDownloads,
}: {
  albums: Album[];
  images: GalleryImage[];
  allowDownloads: boolean;
}) {
  const [activeAlbum, setActiveAlbum] = React.useState<string | "all">("all");
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const visibleImages = activeAlbum === "all" ? images : images.filter((i) => i.albumId === activeAlbum);

  const filters = [{ _id: "all" as const, name: "All Photos" }, ...albums];

  return (
    <div>
      {albums.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f._id}
              onClick={() => setActiveAlbum(f._id)}
              className={cn(
                "btn-radius inline-flex items-center gap-1.5 border px-4 py-2 text-sm font-medium transition-colors",
                activeAlbum === f._id
                  ? "border-primary bg-primary text-white"
                  : "border-border text-foreground hover:border-primary/50"
              )}
            >
              {f._id === "all" && <LayoutGrid className="h-3.5 w-3.5" />}
              {f.name}
            </button>
          ))}
        </div>
      )}

      {visibleImages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted">
          No photos in this album yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleImages.map((img, i) => (
            <button
              key={img._id}
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square overflow-hidden rounded-lg bg-secondary/40"
            >
              {/* unoptimized: this photo is only served to a browser holding this
                  gallery's session cookie; Next's image optimizer fetches server-side
                  without cookies and would get rejected, leaving the photo blank. */}
              <Image
                src={mediaUrl(img.mediaId)}
                alt={img.caption || "Client photo"}
                fill
                sizes="(min-width: 1024px) 24vw, 45vw"
                unoptimized
                className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={visibleImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          allowDownloads={allowDownloads}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
  allowDownloads,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
  allowDownloads: boolean;
}) {
  const image = images[index];

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, images.length, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index - 1 + images.length) % images.length);
        }}
        aria-label="Previous photo"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div className="relative h-[80vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Image
          src={mediaUrl(image.mediaId)}
          alt={image.caption || "Client photo"}
          fill
          sizes="90vw"
          unoptimized
          className="object-contain"
        />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index + 1) % images.length);
        }}
        aria-label="Next photo"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {allowDownloads && (
        <a
          href={mediaUrl(image.mediaId)}
          download
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/90"
        >
          <Download className="h-4 w-4" /> Download
        </a>
      )}
    </div>
  );
}
