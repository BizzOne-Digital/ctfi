"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Input, Label, FormRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function GalleryLoginForm({ initialSlug = "" }: { initialSlug?: string }) {
  const router = useRouter();
  const [slug, setSlug] = React.useState(initialSlug);
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/gallery/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim().toLowerCase(), password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Unable to sign in.");
      router.push(`/gallery/${body.gallery.slug}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm" noValidate>
      <div className="mb-6 flex justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </span>
      </div>
      <FormRow>
        <Label htmlFor="slug" required>
          Gallery Name / Access Code
        </Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. smith-family-2026"
          required
          autoCapitalize="none"
        />
      </FormRow>
      <FormRow>
        <Label htmlFor="password" required>
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </FormRow>

      {status === "error" && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? "Checking…" : "View My Gallery"}
      </Button>
    </form>
  );
}
