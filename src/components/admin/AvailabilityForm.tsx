"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Input, Label, FormRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";
import { cn, formatCalendarDateShort } from "@/lib/utils";
import { apiGet, apiSend, ApiError } from "@/lib/admin-client";
import type { AvailabilityInput } from "@/lib/validation";

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

interface RawSettings extends Omit<AvailabilityInput, "closedDates"> {
  closedDates: string[];
}

export function AvailabilityForm() {
  const [settings, setSettings] = React.useState<RawSettings | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [newClosedDate, setNewClosedDate] = React.useState("");

  const load = React.useCallback(async () => {
    try {
      const res = await apiGet<{ settings: RawSettings }>("/api/admin/availability");
      setSettings({
        ...res.settings,
        closedDates: res.settings.closedDates.map((d) => new Date(d).toISOString().slice(0, 10)),
      });
    } catch {
      toast.error("Unable to load availability settings.");
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (!settings) return <LoadingState label="Loading availability settings…" />;

  function toggleDay(day: number) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            workingDays: prev.workingDays.includes(day)
              ? prev.workingDays.filter((d) => d !== day)
              : [...prev.workingDays, day].sort(),
          }
        : prev
    );
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      await apiSend("/api/admin/availability", "PUT", settings);
      toast.success("Availability settings saved.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            checked={settings.bookingEnabled}
            onChange={(e) => setSettings({ ...settings, bookingEnabled: e.target.checked })}
          />
          Online booking enabled
        </label>
        <p className="mt-1 text-sm text-muted">
          When turned off, the booking page will let visitors know online scheduling is temporarily unavailable.
        </p>
      </div>

      <div>
        <Label>Working Days</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDay(d.value)}
              className={cn(
                "btn-radius border px-4 py-2 text-sm font-medium",
                settings.workingDays.includes(d.value)
                  ? "border-primary bg-primary text-white"
                  : "border-border text-foreground hover:border-primary/50"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <FormRow className="mb-0">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={settings.startTime}
            onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
          />
        </FormRow>
        <FormRow className="mb-0">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={settings.endTime}
            onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <FormRow className="mb-0">
          <Label htmlFor="duration">Appointment Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={5}
            value={settings.appointmentDurationMinutes}
            onChange={(e) => setSettings({ ...settings, appointmentDurationMinutes: Number(e.target.value) })}
          />
        </FormRow>
        <FormRow className="mb-0">
          <Label htmlFor="buffer">Buffer Between Appointments (minutes)</Label>
          <Input
            id="buffer"
            type="number"
            min={0}
            value={settings.bufferMinutes}
            onChange={(e) => setSettings({ ...settings, bufferMinutes: Number(e.target.value) })}
          />
        </FormRow>
      </div>

      <div>
        <Label>Breaks</Label>
        <div className="space-y-2">
          {settings.breaks.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                type="time"
                value={b.start}
                onChange={(e) => {
                  const breaks = [...settings.breaks];
                  breaks[i] = { ...breaks[i], start: e.target.value };
                  setSettings({ ...settings, breaks });
                }}
              />
              <span className="text-muted">to</span>
              <Input
                type="time"
                value={b.end}
                onChange={(e) => {
                  const breaks = [...settings.breaks];
                  breaks[i] = { ...breaks[i], end: e.target.value };
                  setSettings({ ...settings, breaks });
                }}
              />
              <button
                type="button"
                onClick={() => setSettings({ ...settings, breaks: settings.breaks.filter((_, bi) => bi !== i) })}
                className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                aria-label="Remove break"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setSettings({ ...settings, breaks: [...settings.breaks, { start: "12:00", end: "13:00" }] })}
        >
          <Plus className="h-4 w-4" /> Add Break
        </Button>
      </div>

      <div>
        <Label>Closed Dates</Label>
        <div className="flex flex-wrap gap-2">
          {settings.closedDates.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm text-foreground"
            >
              {formatCalendarDateShort(d)}
              <button
                onClick={() => setSettings({ ...settings, closedDates: settings.closedDates.filter((cd) => cd !== d) })}
                aria-label={`Remove closed date ${d}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input type="date" value={newClosedDate} onChange={(e) => setNewClosedDate(e.target.value)} className="w-48" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (newClosedDate && !settings.closedDates.includes(newClosedDate)) {
                setSettings({ ...settings, closedDates: [...settings.closedDates, newClosedDate].sort() });
                setNewClosedDate("");
              }
            }}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <Button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Availability Settings"}
      </Button>
    </div>
  );
}
