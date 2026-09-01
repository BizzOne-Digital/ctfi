"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { gallerySchema, type GalleryInput } from "@/lib/validation";
import { Input, Textarea, Label, FieldError, FormRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { apiSend, ApiError } from "@/lib/admin-client";
import { slugify } from "@/lib/utils";

export interface AdminGallery {
  _id: string;
  name: string;
  slug: string;
  clientName: string;
  clientEmail?: string;
  description?: string;
  coverImageMediaId?: string;
  expirationDate?: string | null;
  active: boolean;
  allowDownloads: boolean;
  allowSharing: boolean;
}

export function GalleryForm({ gallery, onSaved }: { gallery?: AdminGallery; onSaved?: (g: AdminGallery) => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(Boolean(gallery));

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GalleryInput>({
    resolver: zodResolver(gallerySchema) as unknown as Resolver<GalleryInput>,
    defaultValues: gallery
      ? {
          name: gallery.name,
          slug: gallery.slug,
          clientName: gallery.clientName,
          clientEmail: gallery.clientEmail ?? "",
          description: gallery.description ?? "",
          password: "",
          coverImageMediaId: gallery.coverImageMediaId ?? "",
          expirationDate: gallery.expirationDate ? gallery.expirationDate.slice(0, 10) : "",
          active: gallery.active,
          allowDownloads: gallery.allowDownloads,
          allowSharing: gallery.allowSharing,
        }
      : {
          name: "",
          slug: "",
          clientName: "",
          clientEmail: "",
          description: "",
          password: "",
          coverImageMediaId: "",
          expirationDate: "",
          active: true,
          allowDownloads: true,
          allowSharing: false,
        },
  });

  const nameValue = watch("name");

  React.useEffect(() => {
    if (!slugTouched && nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, slugTouched, setValue]);

  async function onSubmit(data: GalleryInput) {
    setSubmitting(true);
    try {
      if (gallery) {
        const res = await apiSend<{ gallery: AdminGallery }>(`/api/admin/galleries/${gallery._id}`, "PUT", data);
        toast.success("Gallery settings saved.");
        onSaved?.(res.gallery);
      } else {
        await apiSend("/api/admin/galleries", "POST", data);
        toast.success("Gallery created.");
        router.push("/admin/galleries");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow>
          <Label htmlFor="name" required>
            Gallery Name
          </Label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          <FieldError message={errors.name?.message} />
        </FormRow>
        <FormRow>
          <Label htmlFor="slug" required>
            Access Code (used to log in)
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

      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow>
          <Label htmlFor="clientName" required>
            Client Name
          </Label>
          <Input id="clientName" {...register("clientName")} aria-invalid={!!errors.clientName} />
          <FieldError message={errors.clientName?.message} />
        </FormRow>
        <FormRow>
          <Label htmlFor="clientEmail">Client Email (optional)</Label>
          <Input id="clientEmail" type="email" {...register("clientEmail")} />
        </FormRow>
      </div>

      <FormRow>
        <Label htmlFor="description">Description (optional, shown to the client)</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </FormRow>

      <FormRow>
        <Label htmlFor="password" required={!gallery}>
          {gallery ? "New Password (leave blank to keep current)" : "Password"}
        </Label>
        <Input id="password" type="text" {...register("password")} aria-invalid={!!errors.password} />
        <FieldError message={errors.password?.message} />
      </FormRow>

      <FormRow>
        <Controller
          control={control}
          name="coverImageMediaId"
          render={({ field }) => (
            <ImagePicker label="Cover Image" folder="gallery" value={field.value} onChange={field.onChange} />
          )}
        />
      </FormRow>

      <FormRow>
        <Label htmlFor="expirationDate">Expiration Date (optional)</Label>
        <Input id="expirationDate" type="date" {...register("expirationDate")} />
      </FormRow>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("active")} />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("allowDownloads")} />
          Allow Downloads
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("allowSharing")} />
          Allow Sharing
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : gallery ? "Save Changes" : "Create Gallery"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/galleries")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
