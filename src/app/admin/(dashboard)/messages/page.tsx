"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Card";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/States";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { apiGet, apiSend, ApiError } from "@/lib/admin-client";
import { formatDate, formatCalendarDate } from "@/lib/utils";

interface AdminMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  preferredDate?: string;
  status: "unread" | "read" | "contacted" | "archived";
  createdAt: string;
}

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "primary"> = {
  unread: "primary",
  read: "neutral",
  contacted: "success",
  archived: "neutral",
};

export default function MessagesPage() {
  const [messages, setMessages] = React.useState<AdminMessage[] | null>(null);
  const [error, setError] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<AdminMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminMessage | null>(null);

  const load = React.useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("q", search);
      const res = await apiGet<{ messages: AdminMessage[] }>(`/api/admin/messages?${params}`);
      setMessages(res.messages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load messages.");
    }
  }, [statusFilter, search]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(msg: AdminMessage, status: AdminMessage["status"]) {
    try {
      await apiSend(`/api/admin/messages/${msg._id}`, "PATCH", { status });
      setMessages((prev) => prev?.map((m) => (m._id === msg._id ? { ...m, status } : m)) ?? null);
      if (selected?._id === msg._id) setSelected({ ...msg, status });
    } catch {
      toast.error("Unable to update message.");
    }
  }

  function openMessage(msg: AdminMessage) {
    setSelected(msg);
    if (msg.status === "unread") updateStatus(msg, "read");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiSend(`/api/admin/messages/${deleteTarget._id}`, "DELETE");
      setMessages((prev) => prev?.filter((m) => m._id !== deleteTarget._id) ?? null);
      setDeleteTarget(null);
      toast.success("Message deleted.");
    } catch {
      toast.error("Unable to delete message.");
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Contact Messages</h1>
      <p className="mt-1 text-sm text-muted">Inquiries submitted through your contact form.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search name, email, subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-9"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          <option value="">All Statuses</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="contacted">Contacted</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <div className="mt-6">
        {messages === null && !error && <LoadingState label="Loading messages…" />}
        {error && <ErrorState description={error} action={<Button onClick={load}>Try Again</Button>} />}
        {messages && messages.length === 0 && <EmptyState title="No messages found" icon={<Mail className="h-9 w-9" />} />}

        {messages && messages.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/30 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {messages.map((m) => (
                  <tr
                    key={m._id}
                    className={m.status === "unread" ? "cursor-pointer bg-primary/5 font-medium" : "cursor-pointer hover:bg-secondary/20"}
                    onClick={() => openMessage(m)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-foreground">{m.name}</p>
                      <p className="text-xs font-normal text-muted">{m.email}</p>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted">{m.subject}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(m.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(m);
                        }}
                        className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete message from ${m.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.subject ?? ""} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> {selected.email}
              </span>
              {selected.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" /> {selected.phone}
                </span>
              )}
              {selected.preferredDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {formatCalendarDate(selected.preferredDate)}
                </span>
              )}
            </div>
            <p className="whitespace-pre-line rounded-lg bg-secondary/30 p-4 text-sm text-foreground">
              {selected.message}
            </p>
            <div className="flex flex-wrap gap-2">
              {(["read", "contacted", "archived"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={selected.status === s ? "primary" : "outline"}
                  onClick={() => updateStatus(selected, s)}
                >
                  Mark {s}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Message"
        description="This message will be permanently deleted. This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
