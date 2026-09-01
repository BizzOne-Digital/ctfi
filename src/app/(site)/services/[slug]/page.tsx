import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Camera } from "lucide-react";
import { Section } from "@/components/public/Section";
import { Button } from "@/components/ui/Button";
import { CTABanner } from "@/components/public/CTABanner";
import { getServiceBySlug } from "@/lib/public-data";
import { mediaUrl, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service Not Found" };
  return { title: service.title, description: service.shortDescription };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const imageUrl = mediaUrl(service.imageMediaId);
  const galleryUrls = (service.galleryImageIds || []).map((id) => mediaUrl(id));

  return (
    <>
      <Section className="pb-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary/40">
            {imageUrl ? (
              <Image src={imageUrl} alt={service.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Camera className="h-14 w-14 text-primary/30" />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">{service.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">{service.shortDescription}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              {service.duration && (
                <span className="rounded-full bg-secondary px-3 py-1.5 text-foreground">{service.duration}</span>
              )}
              <span className="rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
                {service.startingPrice ? `From ${formatCurrency(service.startingPrice)}` : service.priceLabel || "Contact for pricing"}
              </span>
            </div>
            <div className="mt-8">
              <Button href={service.ctaLink || "/book"} size="lg">
                {service.ctaText || "Book This Session"}
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {service.fullDescription && (
        <Section className="pt-0">
          <div className="prose-sm mx-auto max-w-3xl whitespace-pre-line text-base leading-relaxed text-foreground/90">
            {service.fullDescription}
          </div>
        </Section>
      )}

      {galleryUrls.length > 0 && (
        <Section className="bg-secondary/30">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryUrls.map((url, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                <Image src={url} alt={`${service.title} example ${i + 1}`} fill sizes="30vw" className="object-cover" />
              </div>
            ))}
          </div>
        </Section>
      )}

      <CTABanner
        heading="Ready to Get Started?"
        subheading={`Book your ${service.title.toLowerCase()} session today.`}
        ctaText="Book Your Appointment"
        ctaLink="/book"
      />
    </>
  );
}
