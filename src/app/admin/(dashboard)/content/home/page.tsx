import { PageContentEditor } from "@/components/admin/PageContentEditor";

export const metadata = { title: "Home Page Content" };

export default function HomeContentPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Home Page Content</h1>
      <p className="mt-1 text-sm text-muted">Edit every section of your homepage — no code required.</p>
      <div className="mt-8">
        <PageContentEditor page="home" />
      </div>
    </div>
  );
}
