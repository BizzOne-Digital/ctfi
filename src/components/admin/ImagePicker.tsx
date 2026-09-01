"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Upload, X, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Spinner, EmptyState } from "@/components/ui/States";
import { apiGet, apiUpload } from "@/lib/admin-client";
import type { MediaFolder } from "@/models/Media";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  folder: string;
}

export function ImagePicker({
  value,
  onChange,
  folder,
  label = "Image",
}: {
  value?: string;
  onChange: (mediaId: string) => void;
  folder: MediaFolder;
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>}
      <div className="flex items-center gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary/40">
          {value ? (
            // unoptimized: /api/media/[id] requires a session cookie for gallery-folder
            // photos, and Next's image optimizer fetches server-side without cookies —
            // see the longer note in GalleryManager.tsx.
            <Image
              src={`/api/media/${value}`}
              alt=""
              width={96}
              height={96}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-radius border border-border px-3.5 py-2 text-sm font-medium hover:bg-secondary"
          >
            {value ? "Change Image" : "Choose Image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-sm text-muted hover:text-red-600"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <ImagePickerModal
        open={open}
        onClose={() => setOpen(false)}
        folder={folder}
        onSelect={(id) => {
          onChange(id);
          setOpen(false);
        }}
      />
    </div>
  );
}

function ImagePickerModal({
  open,
  onClose,
  folder,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  folder: MediaFolder;
  onSelect: (id: string) => void;
}) {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ media: MediaItem[] }>(`/api/admin/media?folder=${folder}`);
      setItems(res.media);
    } catch {
      toast.error("Couldn't load the media library.");
    } finally {
      setLoading(false);
    }
  }, [folder]);

  React.useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await apiUpload<{ media: MediaItem }>("/api/admin/media/upload", fd);
      toast.success("Image uploaded.");
      setItems((prev) => [res.media, ...prev]);
      onSelect(res.media.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Media Library" size="lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">JPEG, PNG, WEBP, or GIF — up to 10MB.</p>
        <label className="btn-radius inline-flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
          {uploading ? <Spinner className="h-4 w-4 text-white" /> : <Upload className="h-4 w-4" />}
          Upload New
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No images yet" description="Upload your first image to this folder above." />
      ) : (
        <div className="grid max-h-[420px] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border border-border",
                "focus-visible:ring-2 focus-visible:ring-primary"
              )}
              title={item.filename}
            >
              <Image src={item.url} alt={item.filename} fill sizes="150px" unoptimized className="object-cover" />
              <span className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
                <Check className="h-6 w-6 text-white" />
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

export function ImageThumb({ mediaId, alt, className }: { mediaId?: string; alt: string; className?: string }) {
  if (!mediaId) {
    return (
      <div className={cn("flex items-center justify-center bg-secondary/40 text-muted", className)}>
        <X className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image src={`/api/media/${mediaId}`} alt={alt} fill sizes="200px" unoptimized className="object-cover" />
    </div>
  );
}
