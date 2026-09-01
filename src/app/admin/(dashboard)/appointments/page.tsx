"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Trash2, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select, Input } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Card";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/Modal";
import { AppointmentDetailModal, type AdminAppointment } from "@/components/admin/AppointmentDetailModal";
import { apiGet, apiSend, ApiError } from "@/lib/admin-client";
import { formatCalendarDateShort, formatTime12h } from "@/lib/utils";

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "primary"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  rescheduled: "primary",
  completed: "success",
  cancelled: "danger",
};

function AppointmentsPageInner() {
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = React.useState<AdminAppointment[] | null>(null);
  const [error, setError] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState(searchParams.get("status") ?? "");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<AdminAppointment | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminAppointment | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("q", search);
      const res = await apiGet<{ appointments: AdminAppointment[] }>(`/api/admin/appointments?${params}`);
      setAppointments(res.appointments);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load appointments.");
    }
  }, [statusFilter, search]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiSend(`/api/admin/appointments/${deleteTarget._id}`, "DELETE");
      setAppointments((prev) => prev?.filter((a) => a._id !== deleteTarget._id) ?? null);
      setDeleteTarget(null);
    } catch {
      setError("Unable to delete appointment.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Appointments</h1>
          <p className="mt-1 text-sm text-muted">Review, approve, and manage booking requests.</p>
        </div>
        <Button href="/admin/appointments/settings" variant="outline">
          <Settings className="h-4 w-4" /> Availability Settings
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-9"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      <div className="mt-6">
        {appointments === null && !error && <LoadingState label="Loading appointments…" />}
        {error && <ErrorState description={error} action={<Button onClick={load}>Try Again</Button>} />}
        {appointments && appointments.length === 0 && (
          <EmptyState title="No appointments found" description="Try adjusting your filters, or check back later." />
        )}

        {appointments && appointments.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/30 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((a) => (
                  <tr key={a._id} className="cursor-pointer hover:bg-secondary/20" onClick={() => setSelected(a)}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{a.fullName}</p>
                      <p className="text-xs text-muted">{a.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{a.serviceName}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatCalendarDateShort(a.preferredDate)} · {formatTime12h(a.preferredTime)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(a);
                        }}
                        className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete appointment for ${a.fullName}`}
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

      <AppointmentDetailModal
        appointment={selected}
        onClose={() => setSelected(null)}
        onUpdated={(updated) => {
          setAppointments((prev) => prev?.map((a) => (a._id === updated._id ? updated : a)) ?? null);
          setSelected(updated);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Appointment"
        description={`Delete the appointment for "${deleteTarget?.fullName}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <React.Suspense fallback={<LoadingState />}>
      <AppointmentsPageInner />
    </React.Suspense>
  );
}
