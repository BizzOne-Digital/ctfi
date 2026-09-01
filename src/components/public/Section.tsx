import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

export function Section({
  children,
  className,
  containerClassName,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-20 lg:py-24", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = "center",
}: {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  align?: "center" | "left";
}) {
  if (!heading && !subheading) return null;
  return (
    <div className={cn("mx-auto max-w-2xl fade-up", align === "center" ? "text-center" : "text-left mx-0")}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      )}
      {heading && (
        <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">{heading}</h2>
      )}
      {subheading && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{subheading}</p>}
    </div>
  );
}
