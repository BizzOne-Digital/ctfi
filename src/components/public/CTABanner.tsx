import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function CTABanner({
  heading,
  subheading,
  ctaText,
  ctaLink,
}: {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-primary py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, white 0, white 1.5px, transparent 1.5px), radial-gradient(circle at 85% 75%, white 0, white 1.5px, transparent 1.5px), radial-gradient(circle at 50% 50%, white 0, white 1px, transparent 1px)",
          backgroundSize: "140px 140px, 180px 180px, 90px 90px",
        }}
      />
      <Container className="fade-up relative flex flex-col items-center gap-6 text-center">
        <h2 className="font-heading text-3xl font-semibold text-white sm:text-4xl">{heading}</h2>
        {subheading && <p className="max-w-xl text-white/90">{subheading}</p>}
        <Button href={ctaLink || "/book"} size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
          {ctaText || "Book Your Appointment"}
        </Button>
      </Container>
    </section>
  );
}
