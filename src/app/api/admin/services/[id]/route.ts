import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import ServiceModel from "@/models/Service";
import { serviceSchema } from "@/lib/validation";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const service = await ServiceModel.findById(id).lean();
    if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    return NextResponse.json({ service: { ...service, _id: String(service._id) } });
  } catch (err) {
    console.error("Service fetch failed", err);
    return NextResponse.json({ error: "Unable to load the service right now." }, { status: 503 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const conflict = await ServiceModel.findOne({ slug: parsed.data.slug, _id: { $ne: id } });
    if (conflict) {
      return NextResponse.json(
        { error: "A service with that slug already exists. Please choose a different slug." },
        { status: 409 }
      );
    }

    const service = await ServiceModel.findByIdAndUpdate(
      id,
      { ...parsed.data, imageMediaId: parsed.data.imageMediaId || undefined, startingPrice: parsed.data.startingPrice ?? null },
      { new: true, runValidators: true }
    ).lean();

    if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    return NextResponse.json({ service: { ...service, _id: String(service._id) } });
  } catch (err) {
    console.error("Service update failed", err);
    return NextResponse.json({ error: "Unable to update the service right now." }, { status: 503 });
  }
}

/** Lightweight partial update — used for reordering and active/inactive toggles. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body && typeof body === "object") {
    if ("order" in body && typeof (body as Record<string, unknown>).order === "number") {
      patch.order = (body as Record<string, number>).order;
    }
    if ("active" in body && typeof (body as Record<string, unknown>).active === "boolean") {
      patch.active = (body as Record<string, boolean>).active;
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const service = await ServiceModel.findByIdAndUpdate(id, patch, { new: true }).lean();
    if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    return NextResponse.json({ service: { ...service, _id: String(service._id) } });
  } catch (err) {
    console.error("Service patch failed", err);
    return NextResponse.json({ error: "Unable to update the service right now." }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid service id." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const result = await ServiceModel.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ error: "Service not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Service delete failed", err);
    return NextResponse.json({ error: "Unable to delete the service right now." }, { status: 503 });
  }
}
