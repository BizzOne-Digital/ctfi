import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectToDatabase } from "@/lib/db";
import AppointmentModel from "@/models/Appointment";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const service = searchParams.get("service");
    const search = searchParams.get("q")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (service) query.serviceId = service;
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      query.preferredDate = dateFilter;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const appointments = await AppointmentModel.find(query).sort({ preferredDate: 1, preferredTime: 1 }).lean();

    return NextResponse.json({
      appointments: appointments.map((a) => ({ ...a, _id: String(a._id) })),
    });
  } catch (err) {
    console.error("Appointment list failed", err);
    return NextResponse.json({ error: "Unable to load appointments right now." }, { status: 503 });
  }
}
