import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { Section } from "@/components/public/Section";
import { ClientGalleryView } from "@/components/public/ClientGalleryView";
import { getGalleryForViewer } from "@/lib/gallery-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getGalleryForViewer(slug);

  // Password-protected client galleries stay out of search results. Public
  // galleries are meant to be found, so they're indexable like any other page.
  if (result.status !== "ok" || result.gallery.passwordProtected) {
    return { robots: { index: false, follow: false } };
  }
  return { title: result.gallery.name, description: result.gallery.description };
}

export default async function GalleryViewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getGalleryForViewer(slug);

  if (result.status === "not_found") notFound();
  if (result.status === "unauthorized") redirect(`/gallery?next=${encodeURIComponent(result.slug)}`);

  const { gallery, albums, images } = result;

  return (
    <Section>
      <div className="mb-10 text-center">
        {gallery.passwordProtected && (
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Welcome, {gallery.clientName}</p>
        )}
        <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">{gallery.name}</h1>
        {gallery.description && <p className="mx-auto mt-3 max-w-xl text-muted">{gallery.description}</p>}
      </div>

      <ClientGalleryView albums={albums} images={images} allowDownloads={gallery.allowDownloads} />
    </Section>
  );
}
