import { Schema, models, model, type Document, type Model } from "mongoose";

export interface IAdminUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: "owner" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["owner", "admin"], default: "owner" },
  },
  { timestamps: true }
);

export default (models.AdminUser as Model<IAdminUser>) ||
  model<IAdminUser>("AdminUser", AdminUserSchema);
