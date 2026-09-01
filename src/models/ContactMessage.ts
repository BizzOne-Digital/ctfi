import { Schema, models, model, type Document, type Model, Types } from "mongoose";

export type ContactMessageStatus = "unread" | "read" | "contacted" | "archived";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  preferredDate?: Date;
  serviceId?: Types.ObjectId;
  status: ContactMessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    preferredDate: { type: Date },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    status: {
      type: String,
      enum: ["unread", "read", "contacted", "archived"],
      default: "unread",
      index: true,
    },
  },
  { timestamps: true }
);

ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ name: "text", email: "text", subject: "text", message: "text" });

export default (models.ContactMessage as Model<IContactMessage>) ||
  model<IContactMessage>("ContactMessage", ContactMessageSchema);
