"use client";

import * as React from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { Textarea, Input, Label, FormRow } from "@/components/ui/Field";
import { apiSend, ApiError } from "@/lib/admin-client";
import { formatDate, formatCalendarDate, formatTime12h } from "@/lib/utils";
import type { AppointmentStatus } from "@/models/Appointment";

export interface AdminAppointment {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceName: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: AppointmentStatus;
  internalNotes: { text: string; createdAt: string }[];
  createdAt: string;
}

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "primary"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  rescheduled: "primary",
  completed: "success",
  cancelled: "danger",
};

export function AppointmentDetailModal({
  appointment,
  onClose,
  onUpdated,
}: {
  appointment: AdminAppointment | null;
  onClose: () => void;
  onUpdated: (updated: AdminAppointment) => void;
}) {
  const [note, setNote] = React.useState("");
  const [rescheduleDate, setRescheduleDate] = React.useState("");
  const [rescheduleTime, setRescheduleTime] = React.useState("");
  const [showReschedule, setShowReschedule] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setNote("");
    setShowReschedule(false);
    if (appointment) {
      setRescheduleDate(appointment.preferredDate.slice(0, 10));
      setRescheduleTime(appointment.preferredTime);
    }
  }, [appointment]);

  if (!appointment) return null;

  async function patch(data: Record<string, unknown>) {
    if (!appointment) return;
    setSaving(true);
    try {
      const res = await apiSend<{ appointment: AdminAppointment }>(
        `/api/admin/appointments/${appointment._id}`,
        "PATCH",
        data
      );
      onUpdated(res.appointment);
      toast.success("Appointment updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to update appointment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!appointment} onClose={onClose} title="Appointment Details" size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">{appointment.fullName}</p>
            <p className="text-sm text-muted">{appointment.serviceName}</p>
          </div>
          <Badge tone={STATUS_TONE[appointment.status]}>{appointment.status}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-4 rounded-lg bg-secondary/30 p-4 text-sm">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="break-all font-medium text-foreground">{appointment.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Phone</dt>
            <dd className="font-medium text-foreground">{appointment.phone}</dd>
          </div>
          <div>
            <dt className="text-muted">Date</dt>
            <dd className="font-medium text-foreground">{formatCalendarDate(appointment.preferredDate)}</dd>
          </div>
          <div>
            <dt className="text-muted">Time</dt>
            <dd className="font-medium text-foreground">{formatTime12h(appointment.preferredTime)}</dd>
          </div>
        </dl>

        {appointment.notes && (
          <div>
            <p className="text-sm font-medium text-foreground">Client Notes</p>
            <p className="mt-1 whitespace-pre-line text-sm text-muted">{appointment.notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {appointment.status !== "approved" && (
            <Button size="sm" onClick={() => patch({ status: "approved" })} disabled={saving}>
              Approve
            </Button>
          )}
          {appointment.status !== "rejected" && (
            <Button size="sm" variant="outline" onClick={() => patch({ status: "rejected" })} disabled={saving}>
              Reject
            </Button>
          )}
          {appointment.status !== "completed" && (
            <Button size="sm" variant="outline" onClick={() => patch({ status: "completed" })} disabled={saving}>
              Mark Completed
            </Button>
          )}
          {appointment.status !== "cancelled" && (
            <Button size="sm" variant="outline" onClick={() => patch({ status: "cancelled" })} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setShowReschedule((v) => !v)}>
            Reschedule
          </Button>
        </div>

        {showReschedule && (
          <div className="rounded-lg border border-border p-4">
            <div className="grid grid-cols-2 gap-3">
              <FormRow className="mb-0">
                <Label htmlFor="reschedule-date">New Date</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </FormRow>
              <FormRow className="mb-0">
                <Label htmlFor="reschedule-time">New Time</Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </FormRow>
            </div>
            <Button
              size="sm"
              className="mt-3"
              disabled={saving}
              onClick={() =>
                patch({ status: "rescheduled", preferredDate: rescheduleDate, preferredTime: rescheduleTime })
              }
            >
              Save New Time
            </Button>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-foreground">Internal Notes</p>
          <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
            {appointment.internalNotes.length === 0 && <p className="text-sm text-muted">No internal notes yet.</p>}
            {appointment.internalNotes.map((n, i) => (
              <div key={i} className="rounded-lg bg-secondary/30 p-2.5 text-sm">
                <p className="text-foreground">{n.text}</p>
                <p className="mt-1 text-xs text-muted">{formatDate(n.createdAt)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Add an internal note (not visible to the client)…"
              className="flex-1"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            disabled={!note.trim() || saving}
            onClick={async () => {
              await patch({ addNote: note });
              setNote("");
            }}
          >
            Add Note
          </Button>
        </div>
      </div>
    </Modal>
  );
}
