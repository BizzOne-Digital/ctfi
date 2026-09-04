import Image from "next/image";
import { Camera } from "lucide-react";
import { mediaUrl } from "@/lib/utils";

export interface GalleryPreviewItem {
  imageMediaId?: string;
  title?: string;
  description?: string;
}

export function GalleryPreviewGrid({ items }: { items: GalleryPreviewItem[] }) {
  const withImages = items.filter((i) => i.imageMediaId);

  if (withImages.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/50 text-muted">
        <Camera className="h-10 w-10" />
        <p className="text-sm">Featured photos will appear here once the admin adds them.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {withImages.map((item, i) => (
        <div
          key={i}
          className={`fade-up group relative overflow-hidden rounded-xl bg-secondary/40 ${
            i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-square"
          }`}
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <Image
            src={mediaUrl(item.imageMediaId)}
            alt={item.title || "Photography by Country Tyme Foto Imaging"}
            fill
            sizes="(min-width: 1024px) 25vw, 45vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          {item.title && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-sm font-medium text-white">{item.title}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
