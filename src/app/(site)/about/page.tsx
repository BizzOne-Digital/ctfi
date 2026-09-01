import type { Metadata } from "next";
import { ContentBlock } from "@/components/public/ContentBlock";
import { CTABanner } from "@/components/public/CTABanner";
import { getPageSections, findSection, getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "About Us",
    description: `Learn about ${settings.businessName} — our mission, our philosophy, and why we do what we do.`,
  };
}

export default async function AboutPage() {
  const sections = await getPageSections("about");

  const intro = findSection(sections, "intro");
  const mission = findSection(sections, "mission");
  const philosophy = findSection(sections, "philosophy");
  const owner = findSection(sections, "owner");
  const cta = findSection(sections, "cta");

  return (
    <>
      {intro && <ContentBlock heading={intro.heading} body={intro.body} imageMediaId={intro.imageMediaId} />}
      {mission && (
        <ContentBlock
          heading={mission.heading}
          body={mission.body}
          imageMediaId={mission.imageMediaId}
          reverse
          tinted
        />
      )}
      {philosophy && (
        <ContentBlock heading={philosophy.heading} body={philosophy.body} imageMediaId={philosophy.imageMediaId} />
      )}
      {owner && (
        <ContentBlock
          heading={owner.heading}
          body={owner.body}
          imageMediaId={owner.imageMediaId}
          reverse
          tinted
        />
      )}
      {cta && <CTABanner heading={cta.heading} subheading={cta.subheading} ctaText={cta.ctaText} ctaLink={cta.ctaLink} />}
    </>
  );
}
