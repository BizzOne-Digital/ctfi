import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ApertureHeroArt } from "@/components/icons/DecorativeArt";
import { mediaUrl } from "@/lib/utils";

export function Hero({
  heading,
  subheading,
  ctaText,
  ctaLink,
  imageMediaId,
}: {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
  imageMediaId?: string;
}) {
  const imageUrl = mediaUrl(imageMediaId);

  return (
    <section className="relative overflow-hidden bg-secondary/40">
      <div className="absolute inset-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="image-reveal object-cover object-top"
          />
        ) : (
          <ApertureHeroArt className="h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      </div>

      <Container className="relative flex min-h-[70vh] flex-col items-center justify-center py-24 text-center sm:min-h-[80vh]">
        <h1 className="fade-up font-heading text-4xl font-semibold text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
          {heading}
        </h1>
        {subheading && (
          <p
            className="fade-up mt-6 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl"
            style={{ animationDelay: "120ms" }}
          >
            {subheading}
          </p>
        )}
        <div
          className="fade-up mt-9 flex flex-col gap-4 sm:flex-row"
          style={{ animationDelay: "220ms" }}
        >
          <Button href={ctaLink || "/book"} size="lg">
            {ctaText || "Book an Appointment"}
          </Button>
          <Button href="/gallery" size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/10">
            View Client Gallery
          </Button>
        </div>
      </Container>
    </section>
  );
}
