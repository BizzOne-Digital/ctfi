import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import ThemeSettingsModel from "@/models/ThemeSettings";
import { themeSettingsSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await connectToDatabase();
    let theme = await ThemeSettingsModel.findOne();
    if (!theme) theme = await ThemeSettingsModel.create({});
    return NextResponse.json({ theme: theme.toObject() });
  } catch (err) {
    console.error("Theme fetch failed", err);
    return NextResponse.json({ error: "Unable to load theme settings right now." }, { status: 503 });
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

  const parsed = themeSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const theme = await ThemeSettingsModel.findOneAndUpdate({}, parsed.data, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ theme: theme.toObject() });
  } catch (err) {
    console.error("Theme update failed", err);
    return NextResponse.json({ error: "Unable to update theme settings right now." }, { status: 503 });
  }
}
