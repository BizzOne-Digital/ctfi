import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import AppointmentModel, { type AppointmentStatus } from "@/models/Appointment";

const VALID_STATUSES: AppointmentStatus[] = [
  "pending",
  "approved",
  "rejected",
  "rescheduled",
  "completed",
  "cancelled",
];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    await connectToDatabase();
    const appointment = await AppointmentModel.findById(id).lean();
    if (!appointment) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    return NextResponse.json({ appointment: { ...appointment, _id: String(appointment._id) } });
  } catch (err) {
    console.error("Appointment fetch failed", err);
    return NextResponse.json({ error: "Unable to load the appointment right now." }, { status: 503 });
  }
}

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

  const b = (body ?? {}) as Record<string, unknown>;
  const update: Record<string, unknown> = {};

  if (typeof b.status === "string") {
    if (!VALID_STATUSES.includes(b.status as AppointmentStatus)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    update.status = b.status;
  }
  if (typeof b.preferredDate === "string") {
    update.preferredDate = new Date(b.preferredDate);
  }
  if (typeof b.preferredTime === "string") {
    update.preferredTime = b.preferredTime;
  }

  try {
    await connectToDatabase();

    let appointment = await AppointmentModel.findById(id);
    if (!appointment) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });

    if (typeof b.addNote === "string" && b.addNote.trim()) {
      appointment.internalNotes.push({ text: b.addNote.trim(), createdAt: new Date() });
    }

    Object.assign(appointment, update);
    await appointment.save();
    appointment = await AppointmentModel.findById(id);

    return NextResponse.json({ appointment: { ...appointment!.toObject(), _id: String(appointment!._id) } });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "That new date and time conflicts with another appointment." },
        { status: 409 }
      );
    }
    console.error("Appointment update failed", err);
    return NextResponse.json({ error: "Unable to update the appointment right now." }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    await connectToDatabase();
    const result = await AppointmentModel.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Appointment delete failed", err);
    return NextResponse.json({ error: "Unable to delete the appointment right now." }, { status: 503 });
  }
}
