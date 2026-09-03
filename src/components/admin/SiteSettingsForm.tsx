"use client";

import * as React from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/validation";
import { Input, Textarea, Label, FieldError, FormRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { LoadingState } from "@/components/ui/States";
import { apiGet, apiSend, ApiError } from "@/lib/admin-client";

export function SiteSettingsForm() {
  const [loaded, setLoaded] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema) as unknown as Resolver<SiteSettingsInput>,
  });

  React.useEffect(() => {
    apiGet<{ settings: SiteSettingsInput }>("/api/admin/settings")
      .then((res) => {
        reset(res.settings);
        setLoaded(true);
      })
      .catch(() => toast.error("Unable to load site settings."));
  }, [reset]);

  async function onSubmit(data: SiteSettingsInput) {
    setSubmitting(true);
    try {
      await apiSend("/api/admin/settings", "PUT", data);
      toast.success("Site settings saved.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save settings.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) return <LoadingState label="Loading settings…" />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-8">
      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">Business Information</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <FormRow>
            <Label htmlFor="businessName" required>
              Business Name
            </Label>
            <Input id="businessName" {...register("businessName")} aria-invalid={!!errors.businessName} />
            <FieldError message={errors.businessName?.message} />
          </FormRow>
          <FormRow>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </FormRow>
          <FormRow>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </FormRow>
          <FormRow>
            <Label htmlFor="address">Address (optional)</Label>
            <Input id="address" {...register("address")} />
          </FormRow>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">Logo &amp; Favicon</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <Controller
            control={control}
            name="logoMediaId"
            render={({ field }) => (
              <ImagePicker label="Logo" folder="logo" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="faviconMediaId"
            render={({ field }) => (
              <ImagePicker label="Favicon" folder="favicon" value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">Social Media</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FormRow>
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <Input id="instagramUrl" {...register("instagramUrl")} />
          </FormRow>
          <FormRow>
            <Label htmlFor="facebookUrl">Facebook URL</Label>
            <Input id="facebookUrl" {...register("facebookUrl")} />
          </FormRow>
          <FormRow>
            <Label htmlFor="xUrl">X (Twitter) URL</Label>
            <Input id="xUrl" {...register("xUrl")} />
          </FormRow>
          <FormRow>
            <Label htmlFor="tiktokUrl">TikTok URL</Label>
            <Input id="tiktokUrl" {...register("tiktokUrl")} />
          </FormRow>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">SEO &amp; Sharing</h2>
        <div className="mt-4 space-y-5">
          <FormRow>
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input id="seoTitle" {...register("seoTitle")} />
          </FormRow>
          <FormRow>
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea id="seoDescription" rows={2} {...register("seoDescription")} />
          </FormRow>
          <Controller
            control={control}
            name="ogImageMediaId"
            render={({ field }) => (
              <ImagePicker label="Social Sharing Image (Open Graph)" folder="og" value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">Footer</h2>
        <div className="mt-4 space-y-5">
          <FormRow>
            <Label htmlFor="footerText">Footer Description</Label>
            <Textarea id="footerText" rows={2} {...register("footerText")} />
          </FormRow>
          <FormRow>
            <Label htmlFor="copyrightText">Copyright Text</Label>
            <Input id="copyrightText" {...register("copyrightText")} placeholder="e.g. Country Tyme Foto Imaging, LLC. All rights reserved." />
          </FormRow>
        </div>
      </section>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}
