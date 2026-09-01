import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import ServiceModel from "@/models/Service";
import { ServiceForm } from "@/components/admin/ServiceForm";
import type { PlainService } from "@/lib/public-data";

export const metadata = { title: "Edit Service" };
export const dynamic = "force-dynamic";

async function getService(id: string): Promise<PlainService | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectToDatabase();
  const doc = await ServiceModel.findById(id).lean();
  if (!doc) return null;
  return JSON.parse(JSON.stringify({ ...doc, _id: String(doc._id) }));
}

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Edit Service</h1>
      <p className="mt-1 text-sm text-muted">{service.title}</p>
      <div className="mt-8">
        <ServiceForm service={service} />
      </div>
    </div>
  );
}
