import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import AvailabilitySettingsModel from "@/models/AvailabilitySettings";
import AppointmentModel, { type AppointmentStatus } from "@/models/Appointment";
import { getAvailableSlots, isFutureOrToday } from "@/lib/availability";
import { DEFAULT_AVAILABILITY } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: "A valid date (YYYY-MM-DD) is required." }, { status: 400 });
  }

  if (!isFutureOrToday(dateStr)) {
    return NextResponse.json({ slots: [], reason: "past" });
  }

  try {
    await connectToDatabase();
    const settingsDoc = await AvailabilitySettingsModel.findOne().lean();
    const settings = settingsDoc ?? DEFAULT_AVAILABILITY;

    if (!settings.bookingEnabled) {
      return NextResponse.json({ slots: [], reason: "booking_disabled" });
    }

    const date = new Date(`${dateStr}T00:00:00.000Z`);
    const dayStart = new Date(dateStr);
    const dayEnd = new Date(dateStr);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const existing = await AppointmentModel.find({
      preferredDate: { $gte: dayStart, $lt: dayEnd },
    })
      .select("preferredTime status")
      .lean<{ preferredTime: string; status: AppointmentStatus }[]>();

    const slots = getAvailableSlots(
      date,
      {
        workingDays: settings.workingDays,
        startTime: settings.startTime,
        endTime: settings.endTime,
        appointmentDurationMinutes: settings.appointmentDurationMinutes,
        bufferMinutes: settings.bufferMinutes,
        breaks: settings.breaks,
        closedDates: settings.closedDates as unknown as Date[],
        bookingEnabled: settings.bookingEnabled,
      },
      existing
    );

    return NextResponse.json({ slots });
  } catch (err) {
    console.error("Availability lookup failed", err);
    return NextResponse.json({ error: "Unable to check availability right now." }, { status: 503 });
  }
}
