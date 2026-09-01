import { Schema, models, model, type Document, type Model } from "mongoose";

export interface INavigationItem extends Document {
  label: string;
  url: string;
  order: number;
  visible: boolean;
  openInNewTab: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NavigationItemSchema = new Schema<INavigationItem>(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
    openInNewTab: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default (models.NavigationItem as Model<INavigationItem>) ||
  model<INavigationItem>("NavigationItem", NavigationItemSchema);
