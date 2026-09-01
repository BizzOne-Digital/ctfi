import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/public/Section";
import { ServiceCard } from "@/components/public/ServiceCard";
import { EmptyState } from "@/components/ui/States";
import { CTABanner } from "@/components/public/CTABanner";
import { getActiveServices } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore our photography services — portrait, family, individual sessions, and special moments.",
};

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <>
      <Section className="pb-8">
        <SectionHeading
          eyebrow="What We Offer"
          heading="Our Services"
          subheading="Every session is tailored to you. Browse what we offer below, or reach out if you don't see exactly what you're looking for."
        />
      </Section>

      <Section className="pt-0">
        {services.length === 0 ? (
          <EmptyState
            title="Services coming soon"
            description="The admin is setting up service details. Please check back shortly or contact us directly."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <ServiceCard key={service._id} service={service} index={i} />
            ))}
          </div>
        )}
      </Section>

      <CTABanner
        heading="Not Sure Which Session Is Right for You?"
        subheading="Reach out and we'll help you find the perfect fit."
        ctaText="Book Your Appointment"
        ctaLink="/book"
      />
    </>
  );
}
