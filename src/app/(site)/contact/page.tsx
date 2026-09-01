import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { Section, SectionHeading } from "@/components/public/Section";
import { ContactForm } from "@/components/public/ContactForm";
import { getSiteSettings } from "@/lib/site-data";
import { getActiveServices } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Country Tyme Foto Imaging to ask a question or plan your session.",
};

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getSiteSettings(), getActiveServices()]);

  return (
    <Section>
      <SectionHeading
        eyebrow="Get In Touch"
        heading="Contact Us"
        subheading="Have a question, or ready to plan your session? Send us a message and we'll respond as soon as we can."
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h3 className="font-heading text-xl font-semibold text-foreground">{settings.businessName}</h3>
          <ul className="mt-6 space-y-5 text-sm">
            {settings.phone && (
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`} className="text-muted hover:text-primary">
                    {settings.phone}
                  </a>
                </div>
              </li>
            )}
            {settings.email && (
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a href={`mailto:${settings.email}`} className="break-all text-muted hover:text-primary">
                    {settings.email}
                  </a>
                </div>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Location</p>
                  <p className="text-muted">{settings.address}</p>
                </div>
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:col-span-3">
          <ContactForm services={services} />
        </div>
      </div>
    </Section>
  );
}
