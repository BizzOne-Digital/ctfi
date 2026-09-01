import { Schema, models, model, type Document, type Model, Types } from "mongoose";

export type MediaFolder = "logo" | "favicon" | "hero" | "services" | "gallery" | "og" | "general";

export interface IMedia extends Document {
  filename: string;
  contentType: string;
  size: number;
  gridfsId: Types.ObjectId;
  folder: MediaFolder;
  width?: number;
  height?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    gridfsId: { type: Schema.Types.ObjectId, required: true },
    folder: {
      type: String,
      enum: ["logo", "favicon", "hero", "services", "gallery", "og", "general"],
      default: "general",
      index: true,
    },
    width: Number,
    height: Number,
  },
  { timestamps: true }
);

export default (models.Media as Model<IMedia>) || model<IMedia>("Media", MediaSchema);
