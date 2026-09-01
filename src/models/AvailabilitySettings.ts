import { Schema, models, model, type Document, type Model } from "mongoose";

export interface IAvailabilityBreak {
  start: string;
  end: string;
}

export interface IAvailabilitySettings extends Document {
  workingDays: number[]; // 0=Sunday .. 6=Saturday
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  appointmentDurationMinutes: number;
  bufferMinutes: number;
  breaks: IAvailabilityBreak[];
  closedDates: Date[];
  bookingEnabled: boolean;
  updatedAt: Date;
}

const AvailabilityBreakSchema = new Schema<IAvailabilityBreak>(
  { start: String, end: String },
  { _id: false }
);

const AvailabilitySettingsSchema = new Schema<IAvailabilitySettings>(
  {
    workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    startTime: { type: String, default: "09:00" },
    endTime: { type: String, default: "17:00" },
    appointmentDurationMinutes: { type: Number, default: 60 },
    bufferMinutes: { type: Number, default: 15 },
    breaks: { type: [AvailabilityBreakSchema], default: [{ start: "12:00", end: "13:00" }] },
    closedDates: { type: [Date], default: [] },
    bookingEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.AvailabilitySettings as Model<IAvailabilitySettings>) ||
  model<IAvailabilitySettings>("AvailabilitySettings", AvailabilitySettingsSchema);
