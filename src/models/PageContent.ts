import { Schema, models, model, type Document, type Model } from "mongoose";

export interface IPageSectionItem {
  title?: string;
  description?: string;
  imageMediaId?: string;
  icon?: string;
}

export interface IPageSection {
  key: string;
  order: number;
  visible: boolean;
  heading?: string;
  subheading?: string;
  body?: string;
  ctaText?: string;
  ctaLink?: string;
  imageMediaId?: string;
  items: IPageSectionItem[];
}

export interface IPageContent extends Document {
  page: "home" | "about";
  sections: IPageSection[];
  updatedAt: Date;
}

const PageSectionItemSchema = new Schema<IPageSectionItem>(
  {
    title: String,
    description: String,
    imageMediaId: String,
    icon: String,
  },
  { _id: false }
);

const PageSectionSchema = new Schema<IPageSection>(
  {
    key: { type: String, required: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    heading: String,
    subheading: String,
    body: String,
    ctaText: String,
    ctaLink: String,
    imageMediaId: String,
    items: { type: [PageSectionItemSchema], default: [] },
  },
  { _id: false }
);

const PageContentSchema = new Schema<IPageContent>(
  {
    page: { type: String, enum: ["home", "about"], required: true, unique: true },
    sections: { type: [PageSectionSchema], default: [] },
  },
  { timestamps: true }
);

export default (models.PageContent as Model<IPageContent>) ||
  model<IPageContent>("PageContent", PageContentSchema);
