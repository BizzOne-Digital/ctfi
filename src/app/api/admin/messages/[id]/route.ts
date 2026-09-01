import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import ContactMessageModel, { type ContactMessageStatus } from "@/models/ContactMessage";

const VALID_STATUSES: ContactMessageStatus[] = ["unread", "read", "contacted", "archived"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const status = (body as Record<string, unknown>)?.status;
  if (typeof status !== "string" || !VALID_STATUSES.includes(status as ContactMessageStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const message = await ContactMessageModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    return NextResponse.json({ message: { ...message, _id: String(message._id) } });
  } catch (err) {
    console.error("Message update failed", err);
    return NextResponse.json({ error: "Unable to update the message right now." }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    await connectToDatabase();
    const result = await ContactMessageModel.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ error: "Message not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Message delete failed", err);
    return NextResponse.json({ error: "Unable to delete the message right now." }, { status: 503 });
  }
}
