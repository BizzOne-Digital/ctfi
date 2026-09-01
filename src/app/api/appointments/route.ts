import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import AppointmentModel, { type AppointmentStatus } from "@/models/Appointment";
import AvailabilitySettingsModel from "@/models/AvailabilitySettings";
import ServiceModel from "@/models/Service";
import { appointmentSchema } from "@/lib/validation";
import { getAvailableSlots, isFutureOrToday } from "@/lib/availability";
import { DEFAULT_AVAILABILITY } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`book:${ip}`, 6, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many booking attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors and try again.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { serviceId, preferredDate, preferredTime, ...rest } = parsed.data;

  if (!isFutureOrToday(preferredDate)) {
    return NextResponse.json({ error: "Please choose a current or future date." }, { status: 400 });
  }
  if (!Types.ObjectId.isValid(serviceId)) {
    return NextResponse.json({ error: "Please choose a valid service." }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const service = await ServiceModel.findById(serviceId).lean();
    if (!service || !service.active) {
      return NextResponse.json({ error: "That service is not currently available." }, { status: 400 });
    }

    const settingsDoc = await AvailabilitySettingsModel.findOne().lean();
    const settings = settingsDoc ?? DEFAULT_AVAILABILITY;
    if (!settings.bookingEnabled) {
      return NextResponse.json(
        { error: "Online booking is temporarily unavailable. Please contact us directly." },
        { status: 400 }
      );
    }

    const date = new Date(`${preferredDate}T00:00:00.000Z`);
    const dayStart = new Date(preferredDate);
    const dayEnd = new Date(preferredDate);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const existing = await AppointmentModel.find({ preferredDate: { $gte: dayStart, $lt: dayEnd } })
      .select("preferredTime status")
      .lean<{ preferredTime: string; status: AppointmentStatus }[]>();

    const availableSlots = getAvailableSlots(
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

    if (!availableSlots.includes(preferredTime)) {
      return NextResponse.json(
        { error: "That time slot is no longer available. Please choose a different time." },
        { status: 409 }
      );
    }

    const appointment = await AppointmentModel.create({
      ...rest,
      serviceId,
      serviceName: service.title,
      preferredDate: date,
      preferredTime,
      status: "pending",
    });

    // NOTE: No email notification is sent here. If you add an email provider
    // (see .env.example), this is the place to email the client a booking
    // confirmation and/or notify the studio of a new request. Do not mark
    // the response as "confirmation sent" until that call actually succeeds.

    return NextResponse.json({
      appointment: {
        id: String(appointment._id),
        serviceName: appointment.serviceName,
        preferredDate: appointment.preferredDate,
        preferredTime: appointment.preferredTime,
        status: appointment.status,
      },
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "That time slot was just booked by someone else. Please choose a different time." },
        { status: 409 }
      );
    }
    console.error("Appointment creation failed", err);
    return NextResponse.json(
      { error: "We couldn't submit your booking right now. Please try again shortly." },
      { status: 503 }
    );
  }
}
