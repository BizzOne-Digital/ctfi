import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import NavigationItemModel from "@/models/NavigationItem";
import { navigationItemSchema } from "@/lib/validation";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = navigationItemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide valid navigation details." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const item = await NavigationItemModel.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!item) return NextResponse.json({ error: "Navigation item not found." }, { status: 404 });
    revalidatePath("/", "layout");
    return NextResponse.json({ item: { ...item, _id: String(item._id) } });
  } catch (err) {
    console.error("Navigation update failed", err);
    return NextResponse.json({ error: "Unable to update navigation item right now." }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    await connectToDatabase();
    const result = await NavigationItemModel.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ error: "Navigation item not found." }, { status: 404 });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Navigation delete failed", err);
    return NextResponse.json({ error: "Unable to delete navigation item right now." }, { status: 503 });
  }
}
