import { Schema, models, model, type Document, type Model, Types } from "mongoose";

export type AppointmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "rescheduled"
  | "completed"
  | "cancelled";

export interface IAppointmentNote {
  text: string;
  createdAt: Date;
}

export interface IAppointment extends Document {
  fullName: string;
  email: string;
  phone: string;
  serviceId?: Types.ObjectId;
  serviceName: string;
  preferredDate: Date;
  preferredTime: string;
  notes?: string;
  status: AppointmentStatus;
  internalNotes: IAppointmentNote[];
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentNoteSchema = new Schema<IAppointmentNote>(
  { text: { type: String, required: true }, createdAt: { type: Date, default: Date.now } },
  { _id: false }
);

const AppointmentSchema = new Schema<IAppointment>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    serviceName: { type: String, required: true },
    preferredDate: { type: Date, required: true, index: true },
    preferredTime: { type: String, required: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "rescheduled", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    internalNotes: { type: [AppointmentNoteSchema], default: [] },
  },
  { timestamps: true }
);

AppointmentSchema.index({ preferredDate: 1, status: 1 });

// Prevents two active bookings from ever landing on the exact same date+time
// slot, even under concurrent requests — the application also pre-checks
// availability, but this index is the hard guarantee against double-booking.
AppointmentSchema.index(
  { preferredDate: 1, preferredTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "approved", "rescheduled", "completed"] },
    },
  }
);

export default (models.Appointment as Model<IAppointment>) ||
  model<IAppointment>("Appointment", AppointmentSchema);
