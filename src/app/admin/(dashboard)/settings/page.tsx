import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export const metadata = { title: "Site Settings" };

export default function SiteSettingsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Site Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Business details, logo, social links, and SEO — used across your entire site.
      </p>
      <div className="mt-8">
        <SiteSettingsForm />
      </div>
    </div>
  );
}
