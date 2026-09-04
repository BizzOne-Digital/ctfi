"use client";

import * as React from "react";
import { toast } from "sonner";
import { Upload, Trash2, Star, Plus, Pencil, X, Check, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Select } from "@/components/ui/Field";
import { EmptyState, Spinner } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/Modal";
import { GalleryForm, type AdminGallery } from "@/components/admin/GalleryForm";
import { apiSend, apiUpload, ApiError } from "@/lib/admin-client";
import { cn, mediaUrl } from "@/lib/utils";
import Image from "next/image";

interface Album {
  _id: string;
  name: string;
  description?: string;
}

interface GalleryImage {
  _id: string;
  albumId: string | null;
  mediaId: string;
  caption?: string;
  order: number;
  isCover: boolean;
}

export function GalleryManager({
  gallery: initialGallery,
  albums: initialAlbums,
  images: initialImages,
}: {
  gallery: AdminGallery;
  albums: Album[];
  images: GalleryImage[];
}) {
  const [tab, setTab] = React.useState<"photos" | "settings">("photos");
  const [gallery, setGallery] = React.useState(initialGallery);
  const [albums, setAlbums] = React.useState(initialAlbums);
  const [images, setImages] = React.useState(initialImages);
  const [activeAlbum, setActiveAlbum] = React.useState<string | "all">("all");
  const [uploading, setUploading] = React.useState(false);
  const [newAlbumName, setNewAlbumName] = React.useState("");
  const [renamingAlbum, setRenamingAlbum] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [deleteAlbumTarget, setDeleteAlbumTarget] = React.useState<Album | null>(null);
  const [deleteImageTarget, setDeleteImageTarget] = React.useState<GalleryImage | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const visibleImages =
    activeAlbum === "all"
      ? images
      : activeAlbum === "unsorted"
        ? images.filter((i) => !i.albumId)
        : images.filter((i) => i.albumId === activeAlbum);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      if (activeAlbum !== "all" && activeAlbum !== "unsorted") fd.append("albumId", activeAlbum);
      const res = await apiUpload<{ images: GalleryImage[] }>(`/api/admin/galleries/${gallery._id}/images`, fd);
      setImages((prev) => [...prev, ...res.images]);
      toast.success(`${res.images.length} photo${res.images.length === 1 ? "" : "s"} uploaded.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function addAlbum() {
    if (!newAlbumName.trim()) return;
    try {
      const res = await apiSend<{ album: Album }>(`/api/admin/galleries/${gallery._id}/albums`, "POST", {
        name: newAlbumName.trim(),
      });
      setAlbums((prev) => [...prev, res.album]);
      setNewAlbumName("");
      toast.success("Album created.");
    } catch {
      toast.error("Unable to create album.");
    }
  }

  async function renameAlbum(albumId: string) {
    if (!renameValue.trim()) return;
    try {
      await apiSend(`/api/admin/galleries/${gallery._id}/albums/${albumId}`, "PUT", { name: renameValue.trim() });
      setAlbums((prev) => prev.map((a) => (a._id === albumId ? { ...a, name: renameValue.trim() } : a)));
      setRenamingAlbum(null);
    } catch {
      toast.error("Unable to rename album.");
    }
  }

  async function confirmDeleteAlbum() {
    if (!deleteAlbumTarget) return;
    try {
      await apiSend(`/api/admin/galleries/${gallery._id}/albums/${deleteAlbumTarget._id}`, "DELETE");
      setAlbums((prev) => prev.filter((a) => a._id !== deleteAlbumTarget._id));
      setImages((prev) => prev.map((i) => (i.albumId === deleteAlbumTarget._id ? { ...i, albumId: null } : i)));
      if (activeAlbum === deleteAlbumTarget._id) setActiveAlbum("all");
      setDeleteAlbumTarget(null);
      toast.success("Album deleted. Photos moved to Unsorted.");
    } catch {
      toast.error("Unable to delete album.");
    }
  }

  async function moveImage(image: GalleryImage, albumId: string | null) {
    try {
      await apiSend(`/api/admin/galleries/${gallery._id}/images/${image._id}`, "PATCH", { albumId });
      setImages((prev) => prev.map((i) => (i._id === image._id ? { ...i, albumId } : i)));
    } catch {
      toast.error("Unable to move photo.");
    }
  }

  async function setCover(image: GalleryImage) {
    try {
      await apiSend(`/api/admin/galleries/${gallery._id}/images/${image._id}`, "PATCH", { isCover: true });
      setImages((prev) => prev.map((i) => ({ ...i, isCover: i._id === image._id })));
      toast.success("Cover photo updated.");
    } catch {
      toast.error("Unable to set cover photo.");
    }
  }

  async function confirmDeleteImage() {
    if (!deleteImageTarget) return;
    try {
      await apiSend(`/api/admin/galleries/${gallery._id}/images/${deleteImageTarget._id}`, "DELETE");
      setImages((prev) => prev.filter((i) => i._id !== deleteImageTarget._id));
      setDeleteImageTarget(null);
      toast.success("Photo deleted.");
    } catch {
      toast.error("Unable to delete photo.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-border">
        {[
          { key: "photos" as const, label: "Photos & Albums" },
          { key: "settings" as const, label: "Settings" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium",
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "settings" && (
        <GalleryForm gallery={gallery} onSaved={(g) => setGallery({ ...gallery, ...g })} />
      )}

      {tab === "photos" && (
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <FilterChip active={activeAlbum === "all"} onClick={() => setActiveAlbum("all")}>
                <LayoutGrid className="h-3.5 w-3.5" /> All Photos
              </FilterChip>
              <FilterChip active={activeAlbum === "unsorted"} onClick={() => setActiveAlbum("unsorted")}>
                Unsorted
              </FilterChip>
              {albums.map((a) =>
                renamingAlbum === a._id ? (
                  <span key={a._id} className="flex items-center gap-1">
                    <Input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="h-8 w-32 py-1"
                    />
                    <button onClick={() => renameAlbum(a._id)} className="rounded p-1 hover:bg-secondary">
                      <Check className="h-4 w-4 text-primary" />
                    </button>
                    <button onClick={() => setRenamingAlbum(null)} className="rounded p-1 hover:bg-secondary">
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ) : (
                  <span key={a._id} className="group relative">
                    <FilterChip active={activeAlbum === a._id} onClick={() => setActiveAlbum(a._id)}>
                      {a.name}
                    </FilterChip>
                    <span className="absolute -right-1 -top-1 hidden gap-0.5 group-hover:flex">
                      <button
                        onClick={() => {
                          setRenamingAlbum(a._id);
                          setRenameValue(a.name);
                        }}
                        className="rounded-full bg-surface p-0.5 shadow"
                        aria-label={`Rename ${a.name}`}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setDeleteAlbumTarget(a)}
                        className="rounded-full bg-surface p-0.5 shadow"
                        aria-label={`Delete ${a.name}`}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </button>
                    </span>
                  </span>
                )
              )}
              <span className="flex items-center gap-1">
                <Input
                  placeholder="New album…"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAlbum()}
                  className="h-8 w-32 py-1"
                />
                <button onClick={addAlbum} className="rounded p-1.5 hover:bg-secondary" aria-label="Add album">
                  <Plus className="h-4 w-4" />
                </button>
              </span>
            </div>

            <label className="btn-radius inline-flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
              {uploading ? <Spinner className="h-4 w-4 text-white" /> : <Upload className="h-4 w-4" />}
              Upload Photos
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {visibleImages.length === 0 ? (
            <EmptyState title="No photos here yet" description="Upload photos using the button above." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {visibleImages.map((img) => (
                <div key={img._id} className="group relative overflow-hidden rounded-lg border border-border">
                  <div className="relative aspect-square bg-secondary/40">
                    {/* unoptimized: Next's built-in image optimizer fetches this URL
                        server-side WITHOUT the browser's cookies, and /api/media/[id]
                        requires the admin/gallery session cookie for gallery photos —
                        so the optimizer's request gets rejected and the preview never
                        loads. Skipping optimization lets the browser request it directly
                        (with cookies), which is what actually works. */}
                    <Image
                      src={mediaUrl(img.mediaId)}
                      alt={img.caption || ""}
                      fill
                      sizes="200px"
                      unoptimized
                      className="object-cover object-top"
                    />
                  </div>
                  {img.isCover && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-primary p-1 text-white">
                      <Star className="h-3 w-3 fill-current" />
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-black/60 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Select
                      value={img.albumId ?? ""}
                      onChange={(e) => moveImage(img, e.target.value || null)}
                      className="h-7 bg-white py-0 text-xs"
                    >
                      <option value="">Unsorted</option>
                      {albums.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name}
                        </option>
                      ))}
                    </Select>
                    <div className="flex justify-between">
                      <button
                        onClick={() => setCover(img)}
                        className="rounded p-1 text-white hover:bg-white/20"
                        aria-label="Set as cover photo"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteImageTarget(img)}
                        className="rounded p-1 text-white hover:bg-white/20"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteAlbumTarget}
        title="Delete Album"
        description={`Delete "${deleteAlbumTarget?.name}"? Photos in it will move to Unsorted, not be deleted.`}
        onConfirm={confirmDeleteAlbum}
        onCancel={() => setDeleteAlbumTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteImageTarget}
        title="Delete Photo"
        description="This photo will be permanently deleted. This cannot be undone."
        onConfirm={confirmDeleteImage}
        onCancel={() => setDeleteImageTarget(null)}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "btn-radius inline-flex items-center gap-1.5 border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-white" : "border-border text-foreground hover:border-primary/50"
      )}
    >
      {children}
    </button>
  );
}
