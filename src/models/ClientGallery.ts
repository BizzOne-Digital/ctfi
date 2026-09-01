import { Schema, models, model, type Document, type Model } from "mongoose";

export interface IClientGallery extends Document {
  name: string;
  slug: string;
  clientName: string;
  clientEmail?: string;
  description?: string;
  passwordHash: string;
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
    passwordHash: { type: String, required: true },
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
