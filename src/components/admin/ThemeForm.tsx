"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Field";
import { LoadingState } from "@/components/ui/States";
import { apiGet, apiSend, ApiError } from "@/lib/admin-client";
import { cn } from "@/lib/utils";
import type { ThemeSettingsInput } from "@/lib/validation";

const COLOR_FIELDS: { key: keyof ThemeSettingsInput; label: string }[] = [
  { key: "colorPrimary", label: "Primary" },
  { key: "colorSecondary", label: "Secondary" },
  { key: "colorAccent", label: "Accent" },
  { key: "colorBackground", label: "Background" },
  { key: "colorForeground", label: "Text" },
];

const CHOICES: {
  key: keyof ThemeSettingsInput;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "buttonStyle",
    label: "Button Style",
    options: [
      { value: "rounded", label: "Rounded" },
      { value: "pill", label: "Pill" },
      { value: "square", label: "Square" },
    ],
  },
  {
    key: "borderRadius",
    label: "Corner Radius",
    options: [
      { value: "none", label: "None" },
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
    ],
  },
  {
    key: "headingFont",
    label: "Heading Font",
    options: [
      { value: "serif", label: "Elegant Serif" },
      { value: "sans", label: "Modern Sans" },
    ],
  },
  {
    key: "headerStyle",
    label: "Header Style",
    options: [
      { value: "standard", label: "Standard" },
      { value: "transparent", label: "Transparent" },
    ],
  },
  {
    key: "heroStyle",
    label: "Hero Style",
    options: [
      { value: "full", label: "Full Width" },
      { value: "split", label: "Split" },
    ],
  },
  {
    key: "sectionSpacing",
    label: "Section Spacing",
    options: [
      { value: "compact", label: "Compact" },
      { value: "comfortable", label: "Comfortable" },
      { value: "spacious", label: "Spacious" },
    ],
  },
];

export function ThemeForm() {
  const [theme, setTheme] = React.useState<ThemeSettingsInput | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    apiGet<{ theme: ThemeSettingsInput }>("/api/admin/theme")
      .then((res) => setTheme(res.theme))
      .catch(() => toast.error("Unable to load theme settings."));
  }, []);

  if (!theme) return <LoadingState label="Loading theme…" />;

  async function save() {
    if (!theme) return;
    setSaving(true);
    try {
      await apiSend("/api/admin/theme", "PUT", theme);
      toast.success("Theme updated — refresh the site to see changes.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save theme.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">Colors</h2>
        <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-5">
          {COLOR_FIELDS.map((f) => (
            <div key={f.key}>
              <Label htmlFor={f.key}>{f.label}</Label>
              <div className="flex items-center gap-2">
                <input
                  id={f.key}
                  type="color"
                  value={theme[f.key] as string}
                  onChange={(e) => setTheme({ ...theme, [f.key]: e.target.value })}
                  className="h-10 w-10 cursor-pointer rounded border border-border"
                />
                <span className="text-xs text-muted">{theme[f.key] as string}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {CHOICES.map((choice) => (
        <section key={choice.key}>
          <Label>{choice.label}</Label>
          <div className="flex flex-wrap gap-2">
            {choice.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme({ ...theme, [choice.key]: opt.value })}
                className={cn(
                  "btn-radius border px-4 py-2 text-sm font-medium",
                  theme[choice.key] === opt.value
                    ? "border-primary bg-primary text-white"
                    : "border-border text-foreground hover:border-primary/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>
      ))}

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Live Preview</p>
        <div
          className="rounded-xl border border-border p-6"
          style={{ background: theme.colorBackground, color: theme.colorForeground }}
        >
          <p className="text-lg font-semibold">Country Tyme Foto Imaging</p>
          <p className="mt-1 text-sm opacity-80">This is how your body text will look.</p>
          <button
            className="mt-4 px-5 py-2.5 text-sm font-medium text-white"
            style={{
              background: theme.colorPrimary,
              borderRadius:
                theme.buttonStyle === "pill" ? "999px" : theme.buttonStyle === "square" ? "0px" : "0.625rem",
            }}
          >
            Book an Appointment
          </button>
        </div>
      </div>

      <Button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Theme"}
      </Button>
    </div>
  );
}
