"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Modal";
import { ImageThumb } from "@/components/admin/ImagePicker";
import { apiGet, apiSend, ApiError } from "@/lib/admin-client";
import { formatCurrency } from "@/lib/utils";
import type { PlainService } from "@/lib/public-data";

export default function ServicesListPage() {
  const [services, setServices] = React.useState<PlainService[] | null>(null);
  const [error, setError] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<PlainService | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    setError("");
    try {
      const res = await apiGet<{ services: PlainService[] }>("/api/admin/services");
      setServices(res.services);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load services.");
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(service: PlainService) {
    try {
      await apiSend(`/api/admin/services/${service._id}`, "PATCH", { active: !service.active });
      setServices((prev) => prev?.map((s) => (s._id === service._id ? { ...s, active: !s.active } : s)) ?? null);
    } catch {
      toast.error("Unable to update service status.");
    }
  }

  async function move(service: PlainService, direction: "up" | "down") {
    if (!services) return;
    const sorted = [...services].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s._id === service._id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];

    try {
      await Promise.all([
        apiSend(`/api/admin/services/${service._id}`, "PATCH", { order: other.order }),
        apiSend(`/api/admin/services/${other._id}`, "PATCH", { order: service.order }),
      ]);
      await load();
    } catch {
      toast.error("Unable to reorder services.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiSend(`/api/admin/services/${deleteTarget._id}`, "DELETE");
      toast.success("Service deleted.");
      setServices((prev) => prev?.filter((s) => s._id !== deleteTarget._id) ?? null);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to delete service.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Services</h1>
          <p className="mt-1 text-sm text-muted">Manage the photography services shown on your site.</p>
        </div>
        <Button href="/admin/services/new">
          <Plus className="h-4 w-4" /> New Service
        </Button>
      </div>

      <div className="mt-8">
        {services === null && !error && <LoadingState label="Loading services…" />}
        {error && <ErrorState description={error} action={<Button onClick={load}>Try Again</Button>} />}
        {services && services.length === 0 && (
          <EmptyState
            title="No services yet"
            description="Add your first service so clients can book it."
            action={
              <Button href="/admin/services/new">
                <Plus className="h-4 w-4" /> New Service
              </Button>
            }
          />
        )}

        {services && services.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/30 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...services]
                  .sort((a, b) => a.order - b.order)
                  .map((s) => (
                    <tr key={s._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ImageThumb mediaId={s.imageMediaId} alt={s.title} className="h-12 w-12 shrink-0 rounded-lg" />
                          <div>
                            <p className="font-medium text-foreground">{s.title}</p>
                            <p className="text-xs text-muted">/{s.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {s.startingPrice ? formatCurrency(s.startingPrice) : s.priceLabel || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(s)}>
                          <Badge tone={s.active ? "success" : "neutral"}>{s.active ? "Active" : "Inactive"}</Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            aria-label="Move up"
                            onClick={() => move(s, "up")}
                            className="rounded p-1 hover:bg-secondary"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            aria-label="Move down"
                            onClick={() => move(s, "down")}
                            className="rounded p-1 hover:bg-secondary"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/services/${s._id}`}
                            className="rounded-lg p-2 text-muted hover:bg-secondary hover:text-primary"
                            aria-label={`Edit ${s.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${s.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
