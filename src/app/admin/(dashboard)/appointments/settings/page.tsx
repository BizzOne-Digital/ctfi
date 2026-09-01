import { AvailabilityForm } from "@/components/admin/AvailabilityForm";

export const metadata = { title: "Availability Settings" };

export default function AvailabilitySettingsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Availability Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Control your working hours, appointment length, breaks, and closed dates for online booking.
      </p>
      <div className="mt-8">
        <AvailabilityForm />
      </div>
    </div>
  );
}
