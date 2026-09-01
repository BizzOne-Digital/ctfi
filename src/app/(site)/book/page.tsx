import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/public/Section";
import { EmptyState } from "@/components/ui/States";
import { BookingFlow } from "@/components/public/BookingFlow";
import { getActiveServices } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Book your photography session with Country Tyme Foto Imaging in just a few steps.",
};

export default async function BookPage() {
  const services = await getActiveServices();

  return (
    <Section>
      <SectionHeading
        eyebrow="Book Now"
        heading="Book Your Appointment"
        subheading="Choose your service, pick a time that works for you, and we'll take it from there."
      />
      <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-surface p-6 sm:p-10">
        {services.length === 0 ? (
          <EmptyState
            title="Booking isn't available yet"
            description="Services haven't been set up yet. Please contact us directly to schedule your session."
          />
        ) : (
          <BookingFlow services={services} />
        )}
      </div>
    </Section>
  );
}
