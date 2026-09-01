import { PageContentEditor } from "@/components/admin/PageContentEditor";

export const metadata = { title: "About Page Content" };

export default function AboutContentPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">About Page Content</h1>
      <p className="mt-1 text-sm text-muted">Edit your story, mission, and philosophy.</p>
      <div className="mt-8">
        <PageContentEditor page="about" />
      </div>
    </div>
  );
}
