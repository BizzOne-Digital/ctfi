import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import NavigationItemModel from "@/models/NavigationItem";
import { navigationItemSchema } from "@/lib/validation";
import { DEFAULT_NAVIGATION } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await connectToDatabase();
    let items = await NavigationItemModel.find().sort({ order: 1 }).lean();
    if (items.length === 0) {
      await NavigationItemModel.insertMany(DEFAULT_NAVIGATION);
      items = await NavigationItemModel.find().sort({ order: 1 }).lean();
    }
    return NextResponse.json({ items: items.map((i) => ({ ...i, _id: String(i._id) })) });
  } catch (err) {
    console.error("Navigation fetch failed", err);
    return NextResponse.json({ error: "Unable to load navigation right now." }, { status: 503 });
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

  const parsed = navigationItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid label and URL." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const item = await NavigationItemModel.create(parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ item: { ...item.toObject(), _id: String(item._id) } }, { status: 201 });
  } catch (err) {
    console.error("Navigation create failed", err);
    return NextResponse.json({ error: "Unable to create navigation item right now." }, { status: 503 });
  }
}
