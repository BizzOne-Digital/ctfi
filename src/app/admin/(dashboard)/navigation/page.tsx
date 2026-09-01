"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/Modal";
import { apiGet, apiSend, ApiError } from "@/lib/admin-client";

interface NavItem {
  _id: string;
  label: string;
  url: string;
  order: number;
  visible: boolean;
  openInNewTab: boolean;
}

export default function NavigationPage() {
  const [items, setItems] = React.useState<NavItem[] | null>(null);
  const [newLabel, setNewLabel] = React.useState("");
  const [newUrl, setNewUrl] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<NavItem | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await apiGet<{ items: NavItem[] }>("/api/admin/navigation");
      setItems(res.items);
    } catch {
      toast.error("Unable to load navigation.");
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function updateItem(item: NavItem, patch: Partial<NavItem>) {
    try {
      await apiSend(`/api/admin/navigation/${item._id}`, "PUT", patch);
      setItems((prev) => prev?.map((i) => (i._id === item._id ? { ...i, ...patch } : i)) ?? null);
    } catch {
      toast.error("Unable to update navigation item.");
    }
  }

  async function move(item: NavItem, direction: "up" | "down") {
    if (!items) return;
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((i) => i._id === item._id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      apiSend(`/api/admin/navigation/${item._id}`, "PUT", { order: other.order }),
      apiSend(`/api/admin/navigation/${other._id}`, "PUT", { order: item.order }),
    ]);
    load();
  }

  async function addItem() {
    if (!newLabel.trim() || !newUrl.trim()) return;
    try {
      const res = await apiSend<{ item: NavItem }>("/api/admin/navigation", "POST", {
        label: newLabel.trim(),
        url: newUrl.trim(),
        order: (items?.length ?? 0) + 1,
      });
      setItems((prev) => [...(prev ?? []), res.item]);
      setNewLabel("");
      setNewUrl("");
      toast.success("Navigation item added.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to add navigation item.");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiSend(`/api/admin/navigation/${deleteTarget._id}`, "DELETE");
      setItems((prev) => prev?.filter((i) => i._id !== deleteTarget._id) ?? null);
      setDeleteTarget(null);
    } catch {
      toast.error("Unable to delete navigation item.");
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Navigation</h1>
      <p className="mt-1 text-sm text-muted">Control the links shown in your site&apos;s header and footer.</p>

      <div className="mt-8 max-w-2xl">
        {items === null && <LoadingState label="Loading navigation…" />}
        {items && items.length === 0 && <EmptyState title="No navigation items" />}

        {items && items.length > 0 && (
          <div className="divide-y divide-border rounded-xl border border-border bg-surface">
            {[...items]
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div key={item._id} className="flex items-center gap-3 p-4">
                  <div className="flex flex-col">
                    <button onClick={() => move(item, "up")} aria-label="Move up" className="rounded p-0.5 hover:bg-secondary">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => move(item, "down")} aria-label="Move down" className="rounded p-0.5 hover:bg-secondary">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Input
                    value={item.label}
                    onChange={(e) => setItems((prev) => prev?.map((i) => (i._id === item._id ? { ...i, label: e.target.value } : i)) ?? null)}
                    onBlur={(e) => updateItem(item, { label: e.target.value })}
                    className="w-40"
                  />
                  <Input
                    value={item.url}
                    onChange={(e) => setItems((prev) => prev?.map((i) => (i._id === item._id ? { ...i, url: e.target.value } : i)) ?? null)}
                    onBlur={(e) => updateItem(item, { url: e.target.value })}
                    className="flex-1"
                  />
                  <button
                    onClick={() => updateItem(item, { visible: !item.visible })}
                    className="rounded-lg p-2 text-muted hover:bg-secondary"
                    aria-label={item.visible ? "Hide item" : "Show item"}
                  >
                    {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${item.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <Input placeholder="Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="w-40" />
          <Input placeholder="/url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="flex-1" />
          <Button onClick={addItem}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Navigation Item"
        description={`Remove "${deleteTarget?.label}" from your navigation?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
