"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { cn, formatCalendarDate, formatTime12h } from "@/lib/utils";
import { appointmentSchema, type AppointmentInput } from "@/lib/validation";
import { Input, Textarea, Label, FieldError, FormRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/States";
import type { PlainService } from "@/lib/public-data";

const STEPS = ["Service", "Date & Time", "Your Info", "Confirm"] as const;

export function BookingFlow({ services }: { services: PlainService[] }) {
  const [step, setStep] = React.useState(0);
  const [serviceId, setServiceId] = React.useState<string>("");
  const [date, setDate] = React.useState<string>("");
  const [time, setTime] = React.useState<string>("");
  const [slots, setSlots] = React.useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = React.useState(false);
  const [slotsError, setSlotsError] = React.useState("");
  const [customer, setCustomer] = React.useState<Omit<AppointmentInput, "serviceId" | "preferredDate" | "preferredTime"> | null>(
    null
  );
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitError, setSubmitError] = React.useState("");

  const selectedService = services.find((s) => s._id === serviceId);
  // Build "today" from the browser's LOCAL date parts, not toISOString()
  // (which is UTC). A native <input type="date"> always shows/returns the
  // viewer's local calendar date, so its `min` must match that — otherwise,
  // for anyone west of UTC, the widget's own "today" can already have
  // rolled to tomorrow while the viewer's clock still reads today, and the
  // browser greys out the correct date as unselectable.
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<AppointmentInput, "serviceId" | "preferredDate" | "preferredTime">>({
    resolver: zodResolver(
      appointmentSchema.omit({ serviceId: true, preferredDate: true, preferredTime: true })
    ),
  });

  async function loadSlots(chosenDate: string) {
    setSlotsLoading(true);
    setSlotsError("");
    setTime("");
    try {
      const res = await fetch(`/api/appointments/availability?date=${chosenDate}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Unable to load availability.");
      setSlots(body.slots ?? []);
      if (!body.slots?.length) {
        setSlotsError(
          body.reason === "past"
            ? "Please choose a current or future date."
            : "No times are available on this date. Please try another day."
        );
      }
    } catch (err) {
      setSlotsError(err instanceof Error ? err.message : "Unable to load availability.");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  async function onSubmitCustomerInfo(data: Omit<AppointmentInput, "serviceId" | "preferredDate" | "preferredTime">) {
    setCustomer(data);
    setStep(3);
  }

  async function confirmBooking() {
    if (!customer) return;
    setSubmitStatus("submitting");
    setSubmitError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customer, serviceId, preferredDate: date, preferredTime: time }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Something went wrong.");
      setSubmitStatus("success");
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (submitStatus === "success") {
    return (
      <div className="fade-up flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-primary" />
        <h2 className="font-heading text-2xl font-semibold text-foreground">Appointment Requested</h2>
        <p className="max-w-md text-muted">
          Thank you! Your request for <strong>{selectedService?.title}</strong> on{" "}
          <strong>{formatCalendarDate(date)}</strong> at <strong>{formatTime12h(time)}</strong> has been received. We
          will confirm your appointment shortly.
        </p>
        <p className="text-xs text-muted">
          Note: this is a request, not a final confirmation, until the studio approves it.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ol className="mb-10 flex items-center justify-between gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                i <= step ? "bg-primary text-white" : "bg-secondary text-muted"
              )}
            >
              {i + 1}
            </span>
            <span className={cn("hidden text-sm font-medium sm:inline", i <= step ? "text-foreground" : "text-muted")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">Choose a Service</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => setServiceId(s._id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                  serviceId === s._id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Camera className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-medium text-foreground">{s.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{s.shortDescription}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <Button disabled={!serviceId} onClick={() => setStep(1)}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">Choose a Date &amp; Time</h2>
          <div className="mt-5 max-w-xs">
            <Label htmlFor="date" required>
              Preferred Date
            </Label>
            <Input
              id="date"
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (e.target.value) loadSlots(e.target.value);
              }}
            />
          </div>

          {date && (
            <div className="mt-6">
              <Label>Available Times</Label>
              {slotsLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted">
                  <Spinner className="h-4 w-4" /> Checking availability…
                </div>
              ) : slotsError ? (
                <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{slotsError}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={cn(
                        "btn-radius border px-4 py-2 text-sm font-medium transition-colors",
                        time === slot
                          ? "border-primary bg-primary text-white"
                          : "border-border text-foreground hover:border-primary/50"
                      )}
                    >
                      {formatTime12h(slot)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button disabled={!date || !time} onClick={() => setStep(2)}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmitCustomerInfo)} noValidate>
          <h2 className="font-heading text-xl font-semibold text-foreground">Your Information</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormRow>
              <Label htmlFor="fullName" required>
                Full Name
              </Label>
              <Input id="fullName" autoComplete="name" {...register("fullName")} aria-invalid={!!errors.fullName} />
              <FieldError message={errors.fullName?.message} />
            </FormRow>
            <FormRow>
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
              <FieldError message={errors.email?.message} />
            </FormRow>
          </div>
          <FormRow>
            <Label htmlFor="phone" required>
              Phone
            </Label>
            <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} aria-invalid={!!errors.phone} />
            <FieldError message={errors.phone?.message} />
          </FormRow>
          <FormRow>
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea id="notes" rows={4} {...register("notes")} />
          </FormRow>

          <div className="mt-4 flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button type="submit">
              Review Booking <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {step === 3 && customer && (
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">Confirm Your Appointment</h2>
          <dl className="mt-5 divide-y divide-border rounded-xl border border-border bg-surface">
            {[
              ["Service", selectedService?.title],
              ["Date", formatCalendarDate(date)],
              ["Time", formatTime12h(time)],
              ["Name", customer.fullName],
              ["Email", customer.email],
              ["Phone", customer.phone],
              ["Notes", customer.notes || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-5 py-3 text-sm">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>

          {submitStatus === "error" && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} disabled={submitStatus === "submitting"}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={confirmBooking} disabled={submitStatus === "submitting"}>
              {submitStatus === "submitting" ? "Submitting…" : "Confirm Appointment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
