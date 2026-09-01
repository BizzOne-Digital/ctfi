import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  href,
  tone = "default",
}: {
  label: string;
  value: number | string;
  href?: string;
  tone?: "default" | "warning";
}) {
  const content = (
    <div className="rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className={cn("mt-2 font-heading text-3xl font-semibold", tone === "warning" && value !== 0 ? "text-amber-600" : "text-foreground")}>
        {value}
      </p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
