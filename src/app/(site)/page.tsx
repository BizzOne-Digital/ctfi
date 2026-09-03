import { Hero } from "@/components/public/Hero";
import { Section, SectionHeading } from "@/components/public/Section";
import { ServiceCard } from "@/components/public/ServiceCard";
import { BenefitCard } from "@/components/public/BenefitCard";
import { GalleryPreviewGrid } from "@/components/public/GalleryGrid";
import { CTABanner } from "@/components/public/CTABanner";
import { SocialLinks } from "@/components/public/SocialLinks";
import { Button } from "@/components/ui/Button";
import { getPageSections, findSection, getSiteSettings } from "@/lib/site-data";
import { getActiveServices } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [sections, services, settings] = await Promise.all([
    getPageSections("home"),
    getActiveServices(),
    getSiteSettings(),
  ]);

  const hero = findSection(sections, "hero");
  const intro = findSection(sections, "intro");
  const servicesPreview = findSection(sections, "services_preview");
  const whyChoose = findSection(sections, "why_choose");
  const featuredGallery = findSection(sections, "featured_gallery");
  const appointmentCta = findSection(sections, "appointment_cta");
  const social = findSection(sections, "social");

  return (
    <>
      {hero && (
        <Hero
          heading={hero.heading}
          subheading={hero.subheading}
          ctaText={hero.ctaText}
          ctaLink={hero.ctaLink}
          imageMediaId={hero.imageMediaId}
        />
      )}

      {intro && (
        <Section>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeading heading={intro.heading} />
            {intro.body && (
              <p className="fade-up mt-5 text-lg leading-relaxed text-muted">{intro.body}</p>
            )}
          </div>
        </Section>
      )}

      {servicesPreview && services.length > 0 && (
        <Section className="bg-secondary/30">
          <SectionHeading heading={servicesPreview.heading} subheading={servicesPreview.subheading} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 4).map((service, i) => (
              <ServiceCard key={service._id} service={service} index={i} />
            ))}
          </div>
          {servicesPreview.ctaText && (
            <div className="mt-12 text-center">
              <Button href={servicesPreview.ctaLink || "/services"} variant="outline" size="lg">
                {servicesPreview.ctaText}
              </Button>
            </div>
          )}
        </Section>
      )}

      {whyChoose && (
        <Section>
          <SectionHeading heading={whyChoose.heading} subheading={whyChoose.subheading} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.items.map((item, i) => (
              <BenefitCard
                key={i}
                title={item.title}
                description={item.description}
                icon={item.icon}
                index={i}
              />
            ))}
          </div>
        </Section>
      )}

      {featuredGallery && (
        <Section className="bg-secondary/30">
          <SectionHeading heading={featuredGallery.heading} subheading={featuredGallery.subheading} />
          <div className="mt-12">
            <GalleryPreviewGrid
              items={featuredGallery.items.map((i) => ({
                imageMediaId: i.imageMediaId,
                title: i.title,
                description: i.description,
              }))}
            />
          </div>
          {featuredGallery.ctaText && (
            <div className="mt-12 text-center">
              <Button href={featuredGallery.ctaLink || "/gallery"} variant="outline" size="lg">
                {featuredGallery.ctaText}
              </Button>
            </div>
          )}
        </Section>
      )}

      {appointmentCta && (
        <CTABanner
          heading={appointmentCta.heading}
          subheading={appointmentCta.subheading}
          ctaText={appointmentCta.ctaText}
          ctaLink={appointmentCta.ctaLink}
        />
      )}

      {social && (
        <Section>
          <SectionHeading heading={social.heading} subheading={social.subheading} />
          <SocialLinks
            className="mt-8"
            instagramUrl={settings.instagramUrl}
            facebookUrl={settings.facebookUrl}
            xUrl={settings.xUrl}
            tiktokUrl={settings.tiktokUrl}
          />
        </Section>
      )}
    </>
  );
}
