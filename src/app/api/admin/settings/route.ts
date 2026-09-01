import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import SiteSettingsModel from "@/models/SiteSettings";
import { siteSettingsSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await connectToDatabase();
    let settings = await SiteSettingsModel.findOne();
    if (!settings) settings = await SiteSettingsModel.create({});
    return NextResponse.json({ settings: settings.toObject() });
  } catch (err) {
    console.error("Settings fetch failed", err);
    return NextResponse.json({ error: "Unable to load settings right now." }, { status: 503 });
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

  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const settings = await SiteSettingsModel.findOneAndUpdate({}, parsed.data, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ settings: settings.toObject() });
  } catch (err) {
    console.error("Settings update failed", err);
    return NextResponse.json({ error: "Unable to update settings right now." }, { status: 503 });
  }
}
