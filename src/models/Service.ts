import { Schema, models, model, type Document, type Model } from "mongoose";

export interface IService extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  imageMediaId?: string;
  galleryImageIds: string[];
  startingPrice?: number | null;
  priceLabel?: string;
  duration?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, default: "" },
    imageMediaId: { type: String, default: "" },
    galleryImageIds: { type: [String], default: [] },
    startingPrice: { type: Number, default: null },
    priceLabel: { type: String, default: "" },
    duration: { type: String, default: "" },
    ctaText: { type: String, default: "Book This Session" },
    ctaLink: { type: String, default: "/book" },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default (models.Service as Model<IService>) || model<IService>("Service", ServiceSchema);
