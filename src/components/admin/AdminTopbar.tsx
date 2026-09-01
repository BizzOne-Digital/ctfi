"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AdminTopbar({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
      <div>
        <p className="text-sm text-muted">Welcome back,</p>
        <p className="font-heading text-base font-semibold text-foreground">{name || email}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button href="/" target="_blank" variant="ghost" size="sm">
          View Site <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={loggingOut}>
          <LogOut className="h-3.5 w-3.5" /> {loggingOut ? "Signing out…" : "Sign Out"}
        </Button>
      </div>
    </header>
  );
}
