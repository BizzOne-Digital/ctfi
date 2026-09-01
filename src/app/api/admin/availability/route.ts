import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import AvailabilitySettingsModel from "@/models/AvailabilitySettings";
import { availabilitySchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await connectToDatabase();
    let settings = await AvailabilitySettingsModel.findOne();
    if (!settings) settings = await AvailabilitySettingsModel.create({});
    return NextResponse.json({ settings: settings.toObject() });
  } catch (err) {
    console.error("Availability fetch failed", err);
    return NextResponse.json({ error: "Unable to load availability settings right now." }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (parsed.data.startTime >= parsed.data.endTime) {
    return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const settings = await AvailabilitySettingsModel.findOneAndUpdate(
      {},
      {
        ...parsed.data,
        closedDates: parsed.data.closedDates.map((d) => new Date(d)),
      },
      { new: true, upsert: true, runValidators: true }
    );
    return NextResponse.json({ settings: settings.toObject() });
  } catch (err) {
    console.error("Availability update failed", err);
    return NextResponse.json({ error: "Unable to update availability settings right now." }, { status: 503 });
  }
}
