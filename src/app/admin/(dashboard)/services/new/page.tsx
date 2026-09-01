import { ServiceForm } from "@/components/admin/ServiceForm";

export const metadata = { title: "New Service" };

export default function NewServicePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">New Service</h1>
      <p className="mt-1 text-sm text-muted">Add a new photography service to your site.</p>
      <div className="mt-8">
        <ServiceForm />
      </div>
    </div>
  );
}
