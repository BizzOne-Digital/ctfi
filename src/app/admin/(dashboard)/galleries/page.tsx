"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Trash2, Lock, Globe, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/Modal";
import { ImageThumb } from "@/components/admin/ImagePicker";
import { apiGet, apiSend, ApiError } from "@/lib/admin-client";
import { formatDateShort } from "@/lib/utils";
import type { AdminGallery } from "@/components/admin/GalleryForm";

export default function GalleriesListPage() {
  const [galleries, setGalleries] = React.useState<(AdminGallery & { createdAt: string })[] | null>(null);
  const [error, setError] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<AdminGallery | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await apiGet<{ galleries: (AdminGallery & { createdAt: string })[] }>("/api/admin/galleries");
      setGalleries(res.galleries);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load galleries.");
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiSend(`/api/admin/galleries/${deleteTarget._id}`, "DELETE");
      toast.success("Gallery deleted.");
      setGalleries((prev) => prev?.filter((g) => g._id !== deleteTarget._id) ?? null);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to delete gallery.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Galleries</h1>
          <p className="mt-1 text-sm text-muted">
            Manage password-protected client galleries and public portfolio galleries.
          </p>
        </div>
        <Button href="/admin/galleries/new">
          <Plus className="h-4 w-4" /> New Gallery
        </Button>
      </div>

      <div className="mt-8">
        {galleries === null && !error && <LoadingState label="Loading galleries…" />}
        {error && <ErrorState description={error} action={<Button onClick={load}>Try Again</Button>} />}
        {galleries && galleries.length === 0 && (
          <EmptyState
            title="No galleries yet"
            description="Create your first client gallery to start sharing photos securely."
            icon={<FolderOpen className="h-9 w-9" />}
            action={
              <Button href="/admin/galleries/new">
                <Plus className="h-4 w-4" /> New Gallery
              </Button>
            }
          />
        )}

        {galleries && galleries.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((g) => (
              <Link
                key={g._id}
                href={`/admin/galleries/${g._id}`}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
              >
                <ImageThumb mediaId={g.coverImageMediaId} alt={g.name} className="aspect-[4/3] w-full" />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{g.name}</p>
                      <p className="text-xs text-muted">{g.clientName}</p>
                    </div>
                    <Badge tone={g.active ? "success" : "neutral"}>{g.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                    {g.passwordProtected ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Globe className="h-3 w-3 text-emerald-600" />
                    )}
                    /gallery/{g.slug}
                    {!g.passwordProtected && <span className="text-emerald-700">· Public</span>}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-xs text-muted">Created {formatDateShort(g.createdAt)}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteTarget(g);
                      }}
                      className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${g.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Gallery"
        description={`Delete "${deleteTarget?.name}" and all of its photos? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
