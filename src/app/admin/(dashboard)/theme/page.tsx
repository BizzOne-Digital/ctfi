import { ThemeForm } from "@/components/admin/ThemeForm";

export const metadata = { title: "Theme & Appearance" };

export default function ThemePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Theme &amp; Appearance</h1>
      <p className="mt-1 text-sm text-muted">
        Customize your site&apos;s colors and styling. Changes apply across the entire public site.
      </p>
      <div className="mt-8">
        <ThemeForm />
      </div>
    </div>
  );
}
