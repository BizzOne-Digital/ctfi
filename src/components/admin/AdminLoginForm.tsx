"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera } from "lucide-react";
import { Input, Label, FormRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Unable to sign in.");
      const next = searchParams.get("next") || "/admin";
      router.push(next);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
            <Camera className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-semibold text-foreground">Admin Sign In</h1>
          <p className="mt-1 text-sm text-muted">Country Tyme Foto Imaging</p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <FormRow>
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormRow>
          <FormRow>
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormRow>

          {status === "error" && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={status === "submitting"}>
            {status === "submitting" ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
