import { Schema, models, model, type Document, type Model } from "mongoose";

export interface IClientGallery extends Document {
  name: string;
  slug: string;
  clientName: string;
  clientEmail?: string;
  description?: string;
  passwordProtected: boolean;
  passwordHash?: string;
  coverImageMediaId?: string;
  expirationDate?: Date | null;
  active: boolean;
  allowDownloads: boolean;
  allowSharing: boolean;
  featuredOnHome: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClientGallerySchema = new Schema<IClientGallery>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, default: "" },
    description: { type: String, default: "" },
    // Password protection is opt-in per gallery. When passwordProtected is
    // false, anyone with the link can view the gallery without logging in —
    // this is what makes a portfolio/showcase gallery public. Existing
    // galleries default to true so previously-created client galleries stay
    // exactly as private as they were before this field existed.
    passwordProtected: { type: Boolean, default: true },
    passwordHash: { type: String, default: "" },
    coverImageMediaId: { type: String, default: "" },
    expirationDate: { type: Date, default: null },
    active: { type: Boolean, default: true, index: true },
    allowDownloads: { type: Boolean, default: true },
    allowSharing: { type: Boolean, default: false },
    featuredOnHome: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default (models.ClientGallery as Model<IClientGallery>) ||
  model<IClientGallery>("ClientGallery", ClientGallerySchema);
