import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import ContactMessageModel from "@/models/ContactMessage";
import { contactFormSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "You've sent several messages recently. Please wait a bit before trying again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors and try again.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const { serviceId, preferredDate, ...rest } = parsed.data;

    await ContactMessageModel.create({
      ...rest,
      serviceId: serviceId && Types.ObjectId.isValid(serviceId) ? serviceId : undefined,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
    });

    // NOTE: No email notification is sent here. If you add an email provider
    // (see .env.example), this is the place to notify the studio of a new
    // inquiry. The message is saved and visible in /admin/messages either way.

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact message save failed", err);
    return NextResponse.json(
      { error: "We couldn't send your message right now. Please try again shortly, or contact us by phone." },
      { status: 503 }
    );
  }
}
