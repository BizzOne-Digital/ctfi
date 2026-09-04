import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Section, SectionHeading } from "@/components/public/Section";
import { GalleryLoginForm } from "@/components/public/GalleryLoginForm";
import { getPublicGalleries } from "@/lib/gallery-data";
import { mediaUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse our photo galleries, and log in to view your private client gallery.",
};

export default async function GalleryLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const publicGalleries = await getPublicGalleries();

  return (
    <>
      {publicGalleries.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Our Work" heading="Galleries" subheading="Browse a selection of our recent work." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publicGalleries.map((g) => (
              <Link
                key={g._id}
                href={`/gallery/${g.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary/40">
                  {g.coverImageMediaId ? (
                    <Image
                      src={mediaUrl(g.coverImageMediaId)}
                      alt={g.name}
                      fill
                      sizes="(min-width: 1024px) 30vw, 50vw"
                      unoptimized
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted">No cover photo</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-heading font-semibold text-foreground">{g.name}</p>
                  {g.description && <p className="mt-1 text-sm text-muted">{g.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section className={publicGalleries.length > 0 ? "bg-secondary/30" : undefined}>
        <SectionHeading
          eyebrow="Private Access"
          heading="Client Gallery"
          subheading="Enter your gallery name and password to view your private photos."
        />
        <div className="mt-12">
          <GalleryLoginForm initialSlug={next ?? ""} />
        </div>
      </Section>
    </>
  );
}
