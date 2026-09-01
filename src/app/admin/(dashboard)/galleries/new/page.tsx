import { GalleryForm } from "@/components/admin/GalleryForm";

export const metadata = { title: "New Gallery" };

export default function NewGalleryPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">New Client Gallery</h1>
      <p className="mt-1 text-sm text-muted">
        Set a name, client details, and password. You can add photos once the gallery is created.
      </p>
      <div className="mt-8">
        <GalleryForm />
      </div>
    </div>
  );
}
