"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { contactFormSchema, type ContactFormInput } from "@/lib/validation";
import { Input, Textarea, Select, Label, FieldError, FormRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { PlainService } from "@/lib/public-data";

export function ContactForm({ services }: { services: PlainService[] }) {
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({ resolver: zodResolver(contactFormSchema) });

  async function onSubmit(data: ContactFormInput) {
    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
      reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="fade-up flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <h3 className="font-heading text-xl font-semibold text-foreground">Message Sent</h3>
        <p className="max-w-sm text-sm text-muted">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow>
          <Label htmlFor="name" required>
            Full Name
          </Label>
          <Input id="name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </FormRow>
        <FormRow>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
          <FieldError message={errors.email?.message} />
        </FormRow>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} aria-invalid={!!errors.phone} />
          <FieldError message={errors.phone?.message} />
        </FormRow>
        <FormRow>
          <Label htmlFor="serviceId">Service (optional)</Label>
          <Select id="serviceId" {...register("serviceId")}>
            <option value="">Not sure / general inquiry</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title}
              </option>
            ))}
          </Select>
        </FormRow>
      </div>

      <FormRow>
        <Label htmlFor="subject" required>
          Subject
        </Label>
        <Input id="subject" {...register("subject")} aria-invalid={!!errors.subject} />
        <FieldError message={errors.subject?.message} />
      </FormRow>

      <FormRow>
        <Label htmlFor="preferredDate">Preferred Date (optional)</Label>
        <Input id="preferredDate" type="date" {...register("preferredDate")} />
      </FormRow>

      <FormRow>
        <Label htmlFor="message" required>
          Message
        </Label>
        <Textarea id="message" rows={5} {...register("message")} aria-invalid={!!errors.message} />
        <FieldError message={errors.message?.message} />
      </FormRow>

      {status === "error" && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
