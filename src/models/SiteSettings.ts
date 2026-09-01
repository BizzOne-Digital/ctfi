import { Schema, models, model, type Document, type Model } from "mongoose";

export interface ISiteSettings extends Document {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  xUrl: string;
  logoMediaId?: string;
  faviconMediaId?: string;
  seoTitle: string;
  seoDescription: string;
  ogImageMediaId?: string;
  footerText: string;
  copyrightText: string;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    businessName: { type: String, required: true, default: "Country Tyme Foto Imaging, LLC" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
    xUrl: { type: String, default: "" },
    logoMediaId: { type: String, default: "" },
    faviconMediaId: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    ogImageMediaId: { type: String, default: "" },
    footerText: { type: String, default: "" },
    copyrightText: { type: String, default: "" },
  },
  { timestamps: true }
);

export default (models.SiteSettings as Model<ISiteSettings>) ||
  model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
