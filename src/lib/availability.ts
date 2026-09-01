import type { IAvailabilitySettings } from "@/models/AvailabilitySettings";
import type { IAppointment } from "@/models/Appointment";

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTimeString(minutes: number) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Returns the list of bookable "HH:mm" start times for a given date, honoring
 * working days/hours, breaks, appointment duration + buffer, closed dates,
 * and existing (pending/approved) appointments on that date.
 */
export function getAvailableSlots(
  date: Date,
  settings: Pick<
    IAvailabilitySettings,
    | "workingDays"
    | "startTime"
    | "endTime"
    | "appointmentDurationMinutes"
    | "bufferMinutes"
    | "breaks"
    | "closedDates"
    | "bookingEnabled"
  >,
  existingAppointments: Pick<IAppointment, "preferredTime" | "status">[]
): string[] {
  if (!settings.bookingEnabled) return [];

  // IMPORTANT: `date` is always constructed as UTC midnight for the chosen
  // calendar day (see callers: `new Date(`${dateStr}T00:00:00.000Z`)`). We
  // must read it back with the UTC getters, not the local ones. `.getDay()`
  // and `.getFullYear()`/`.getMonth()`/`.getDate()` interpret the instant in
  // the SERVER's local timezone, which silently shifts the calendar day by
  // one whenever the server runs behind UTC (e.g. any US timezone) — the
  // exact cause of dates and slots appearing wrong or "unavailable".
  const dayOfWeek = date.getUTCDay();
  if (!settings.workingDays.includes(dayOfWeek)) return [];

  const isClosed = settings.closedDates.some((closed) => {
    const c = new Date(closed);
    return (
      c.getUTCFullYear() === date.getUTCFullYear() &&
      c.getUTCMonth() === date.getUTCMonth() &&
      c.getUTCDate() === date.getUTCDate()
    );
  });
  if (isClosed) return [];

  const start = toMinutes(settings.startTime);
  const end = toMinutes(settings.endTime);
  const step = settings.appointmentDurationMinutes + settings.bufferMinutes;
  if (step <= 0 || end <= start) return [];

  const takenTimes = new Set(
    existingAppointments
      .filter((a) => a.status !== "rejected" && a.status !== "cancelled")
      .map((a) => a.preferredTime)
  );

  const slots: string[] = [];
  for (let t = start; t + settings.appointmentDurationMinutes <= end; t += step) {
    const inBreak = settings.breaks.some((brk) => {
      const bStart = toMinutes(brk.start);
      const bEnd = toMinutes(brk.end);
      return t < bEnd && t + settings.appointmentDurationMinutes > bStart;
    });
    if (inBreak) continue;

    const slot = toTimeString(t);
    if (takenTimes.has(slot)) continue;

    slots.push(slot);
  }

  return slots;
}

/**
 * True if a chosen "YYYY-MM-DD" date is today or in the future (server-side
 * sanity check). Compares pure calendar dates via UTC millisecond values —
 * never through `setHours()`/`getDay()`, which read/write the SERVER's local
 * timezone and would shift "today" by a day whenever the server runs behind
 * UTC, incorrectly rejecting valid dates (including today itself).
 */
export function isFutureOrToday(dateStr: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const chosen = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return chosen >= today;
}
