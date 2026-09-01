import { Schema, models, model, type Document, type Model, Types } from "mongoose";

export interface IGalleryAlbum extends Document {
  galleryId: Types.ObjectId;
  name: string;
  description?: string;
  order: number;
  coverImageMediaId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryAlbumSchema = new Schema<IGalleryAlbum>(
  {
    galleryId: { type: Schema.Types.ObjectId, ref: "ClientGallery", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    coverImageMediaId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default (models.GalleryAlbum as Model<IGalleryAlbum>) ||
  model<IGalleryAlbum>("GalleryAlbum", GalleryAlbumSchema);
