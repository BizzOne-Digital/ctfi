"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState, LoadingState, Spinner } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/Modal";
import { apiGet, apiSend, apiUpload, ApiError } from "@/lib/admin-client";
import { formatDateShort } from "@/lib/utils";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  folder: string;
  size: number;
  createdAt: string;
}

const FOLDERS = ["logo", "favicon", "hero", "services", "gallery", "og", "general"];

export default function MediaLibraryPage() {
  const [media, setMedia] = React.useState<MediaItem[] | null>(null);
  const [folder, setFolder] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<MediaItem | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (folder) params.set("folder", folder);
      if (search) params.set("q", search);
      const res = await apiGet<{ media: MediaItem[] }>(`/api/admin/media?${params}`);
      setMedia(res.media);
    } catch {
      toast.error("Unable to load media library.");
    }
  }, [folder, search]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "general");
        await apiUpload("/api/admin/media/upload", fd);
      }
      toast.success("Upload complete.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiSend(`/api/admin/media/${deleteTarget.id}`, "DELETE");
      setMedia((prev) => prev?.filter((m) => m.id !== deleteTarget.id) ?? null);
      setDeleteTarget(null);
      toast.success("Media deleted.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to delete this file — it may be in use.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Media Library</h1>
          <p className="mt-1 text-sm text-muted">All images uploaded across your site, in one place.</p>
        </div>
        <label className="btn-radius inline-flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
          {uploading ? <Spinner className="h-4 w-4 text-white" /> : <Upload className="h-4 w-4" />}
          Upload
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

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Search filename…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 pl-9" />
        </div>
        <Select value={folder} onChange={(e) => setFolder(e.target.value)} className="w-44">
          <option value="">All Folders</option>
          {FOLDERS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        {media === null && <LoadingState label="Loading media…" />}
        {media && media.length === 0 && <EmptyState title="No media found" description="Upload your first image above." />}
        {media && media.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {media.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-lg border border-border">
                <div className="relative aspect-square bg-secondary/40">
                  <Image src={item.url} alt={item.filename} fill sizes="200px" className="object-cover object-top" />
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-foreground" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-[11px] text-muted">
                    {item.folder} · {formatDateShort(item.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 opacity-0 shadow transition-opacity group-hover:opacity-100"
                  aria-label={`Delete ${item.filename}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Media"
        description={`Delete "${deleteTarget?.filename}"? If it's used elsewhere on your site, that spot will show a placeholder until you replace it.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
