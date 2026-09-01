import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/public/Section";
import { GalleryLoginForm } from "@/components/public/GalleryLoginForm";

export const metadata: Metadata = {
  title: "Client Gallery",
  description: "Log in to view your private photo gallery from Country Tyme Foto Imaging.",
  robots: { index: false, follow: false },
};

export default async function GalleryLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Section>
      <SectionHeading
        eyebrow="Private Access"
        heading="Client Gallery"
        subheading="Enter your gallery name and password to view your private photos."
      />
      <div className="mt-12">
        <GalleryLoginForm initialSlug={next ?? ""} />
      </div>
    </Section>
  );
}
