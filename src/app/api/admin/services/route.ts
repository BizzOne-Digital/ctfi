import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import ServiceModel from "@/models/Service";
import { serviceSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await connectToDatabase();
    const services = await ServiceModel.find().sort({ order: 1 }).lean();
    return NextResponse.json({
      services: services.map((s) => ({ ...s, _id: String(s._id) })),
    });
  } catch (err) {
    console.error("Service list failed", err);
    return NextResponse.json({ error: "Unable to load services right now." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

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

    const existing = await ServiceModel.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json(
        { error: "A service with that slug already exists. Please choose a different slug." },
        { status: 409 }
      );
    }

    const service = await ServiceModel.create({
      ...parsed.data,
      imageMediaId: parsed.data.imageMediaId || undefined,
      startingPrice: parsed.data.startingPrice ?? null,
    });

    return NextResponse.json({ service: { ...service.toObject(), _id: String(service._id) } }, { status: 201 });
  } catch (err) {
    console.error("Service create failed", err);
    return NextResponse.json({ error: "Unable to create the service right now." }, { status: 503 });
  }
}
