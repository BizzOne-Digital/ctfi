import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import PageContentModel from "@/models/PageContent";
import { pageSectionSchema } from "@/lib/validation";
import { DEFAULT_HOME_SECTIONS, DEFAULT_ABOUT_SECTIONS } from "@/lib/constants";

const bodySchema = z.object({ sections: z.array(pageSectionSchema) });

function isValidPage(page: string): page is "home" | "about" {
  return page === "home" || page === "about";
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { page } = await params;
  if (!isValidPage(page)) return NextResponse.json({ error: "Unknown page." }, { status: 400 });

  try {
    await connectToDatabase();
    let doc = await PageContentModel.findOne({ page });
    if (!doc) {
      const defaults = page === "home" ? DEFAULT_HOME_SECTIONS : DEFAULT_ABOUT_SECTIONS;
      doc = await PageContentModel.create({ page, sections: defaults });
    }
    return NextResponse.json({ content: doc.toObject() });
  } catch (err) {
    console.error("Page content fetch failed", err);
    return NextResponse.json({ error: "Unable to load page content right now." }, { status: 503 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { page } = await params;
  if (!isValidPage(page)) return NextResponse.json({ error: "Unknown page." }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the page content for errors." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const doc = await PageContentModel.findOneAndUpdate(
      { page },
      { sections: parsed.data.sections },
      { new: true, upsert: true, runValidators: true }
    );
    revalidatePath(page === "home" ? "/" : "/about");
    return NextResponse.json({ content: doc.toObject() });
  } catch (err) {
    console.error("Page content update failed", err);
    return NextResponse.json({ error: "Unable to save page content right now." }, { status: 503 });
  }
}
