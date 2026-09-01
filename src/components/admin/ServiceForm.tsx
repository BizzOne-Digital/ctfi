"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { serviceSchema, type ServiceInput } from "@/lib/validation";
import { Input, Textarea, Label, FieldError, FormRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { apiSend, ApiError } from "@/lib/admin-client";
import { slugify } from "@/lib/utils";
import type { PlainService } from "@/lib/public-data";

export function ServiceForm({ service }: { service?: PlainService }) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(Boolean(service));

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema) as unknown as Resolver<ServiceInput>,
    defaultValues: service
      ? {
          title: service.title,
          slug: service.slug,
          shortDescription: service.shortDescription,
          fullDescription: service.fullDescription,
          imageMediaId: service.imageMediaId,
          galleryImageIds: service.galleryImageIds,
          startingPrice: service.startingPrice ?? undefined,
          priceLabel: service.priceLabel,
          duration: service.duration,
          ctaText: service.ctaText,
          ctaLink: service.ctaLink,
          order: service.order,
          active: service.active,
        }
      : {
          title: "",
          slug: "",
          shortDescription: "",
          fullDescription: "",
          imageMediaId: "",
          galleryImageIds: [],
          ctaText: "Book This Session",
          ctaLink: "/book",
          order: 0,
          active: true,
        },
  });

  const titleValue = watch("title");

  React.useEffect(() => {
    if (!slugTouched && titleValue) {
      setValue("slug", slugify(titleValue));
    }
  }, [titleValue, slugTouched, setValue]);

  async function onSubmit(data: ServiceInput) {
    setSubmitting(true);
    try {
      if (service) {
        await apiSend(`/api/admin/services/${service._id}`, "PUT", data);
        toast.success("Service updated.");
      } else {
        await apiSend("/api/admin/services", "POST", data);
        toast.success("Service created.");
      }
      router.push("/admin/services");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow>
          <Label htmlFor="title" required>
            Title
          </Label>
          <Input id="title" {...register("title")} aria-invalid={!!errors.title} />
          <FieldError message={errors.title?.message} />
        </FormRow>
        <FormRow>
          <Label htmlFor="slug" required>
            Slug (used in the URL)
          </Label>
          <Input
            id="slug"
            {...register("slug")}
            onChange={(e) => {
              setSlugTouched(true);
              setValue("slug", slugify(e.target.value));
            }}
            aria-invalid={!!errors.slug}
          />
          <FieldError message={errors.slug?.message} />
        </FormRow>
      </div>

      <FormRow>
        <Label htmlFor="shortDescription" required>
          Short Description (shown on cards)
        </Label>
        <Textarea id="shortDescription" rows={2} {...register("shortDescription")} aria-invalid={!!errors.shortDescription} />
        <FieldError message={errors.shortDescription?.message} />
      </FormRow>

      <FormRow>
        <Label htmlFor="fullDescription">Full Description (shown on the service page)</Label>
        <Textarea id="fullDescription" rows={6} {...register("fullDescription")} />
      </FormRow>

      <FormRow>
        <Controller
          control={control}
          name="imageMediaId"
          render={({ field }) => (
            <ImagePicker label="Featured Image" folder="services" value={field.value} onChange={field.onChange} />
          )}
        />
      </FormRow>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormRow>
          <Label htmlFor="startingPrice">Starting Price ($, optional)</Label>
          <Input id="startingPrice" type="number" min={0} step="0.01" {...register("startingPrice")} />
        </FormRow>
        <FormRow>
          <Label htmlFor="priceLabel">Price Label (if no exact price)</Label>
          <Input id="priceLabel" placeholder="e.g. Contact for pricing" {...register("priceLabel")} />
        </FormRow>
        <FormRow>
          <Label htmlFor="duration">Duration (optional)</Label>
          <Input id="duration" placeholder="e.g. 60 minutes" {...register("duration")} />
        </FormRow>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow>
          <Label htmlFor="ctaText">Button Text</Label>
          <Input id="ctaText" {...register("ctaText")} />
        </FormRow>
        <FormRow>
          <Label htmlFor="ctaLink">Button Link</Label>
          <Input id="ctaLink" {...register("ctaLink")} />
        </FormRow>
      </div>

      <FormRow>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("active")} />
          Active (visible on the public site)
        </label>
      </FormRow>

      <div className="mt-2 flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : service ? "Save Changes" : "Create Service"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/services")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
