import Image from "next/image";
import { Section } from "@/components/public/Section";
import { Button } from "@/components/ui/Button";
import { AperturePanelArt } from "@/components/icons/DecorativeArt";
import { mediaUrl } from "@/lib/utils";

export function ContentBlock({
  heading,
  body,
  imageMediaId,
  ctaText,
  ctaLink,
  reverse = false,
  tinted = false,
}: {
  heading?: string;
  body?: string;
  imageMediaId?: string;
  ctaText?: string;
  ctaLink?: string;
  reverse?: boolean;
  tinted?: boolean;
}) {
  const imageUrl = mediaUrl(imageMediaId);
  const hasImage = Boolean(imageUrl);

  return (
    <Section className={tinted ? "bg-secondary/30" : undefined}>
      <div
        className={`grid items-center gap-10 ${hasImage ? "lg:grid-cols-2" : ""} ${
          reverse && hasImage ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        {hasImage && (
          <div className="fade-up relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary/40">
            <Image src={imageUrl} alt={heading || ""} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />
          </div>
        )}
        {!hasImage && (
          <div className="fade-up hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
            <AperturePanelArt className="h-full w-full" />
          </div>
        )}
        <div className="fade-up">
          {heading && <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">{heading}</h2>}
          {body && <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-muted sm:text-lg">{body}</p>}
          {ctaText && (
            <div className="mt-7">
              <Button href={ctaLink || "/book"}>{ctaText}</Button>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
