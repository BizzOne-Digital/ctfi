import { Heart, Camera, BookOpen, Sparkles, Star, Users, Award, ShieldCheck } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Camera,
  BookOpen,
  Sparkles,
  Star,
  Users,
  Award,
  ShieldCheck,
};

export function BenefitCard({
  title,
  description,
  icon,
  index = 0,
}: {
  title?: string;
  description?: string;
  icon?: string;
  index?: number;
}) {
  const Icon = (icon && ICONS[icon]) || Sparkles;
  return (
    <div
      className="fade-up rounded-2xl border border-border bg-surface p-7 text-center transition-shadow hover:shadow-md"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
