import { Loader2, Inbox, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-primary", className)} aria-hidden />;
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted" role="status">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
      <div className="text-muted">{icon ?? <Inbox className="h-9 w-9" />}</div>
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-14 text-center"
      role="alert"
    >
      <AlertTriangle className="h-9 w-9 text-red-500" />
      <h3 className="font-heading text-lg font-semibold text-red-800">{title}</h3>
      <p className="max-w-sm text-sm text-red-700">{description}</p>
      {action}
    </div>
  );
}
