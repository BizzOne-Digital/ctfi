import { Schema, models, model, type Document, type Model, Types } from "mongoose";

export interface IGalleryImage extends Document {
  galleryId: Types.ObjectId;
  albumId?: Types.ObjectId | null;
  mediaId: string;
  caption?: string;
  order: number;
  isCover: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    galleryId: { type: Schema.Types.ObjectId, ref: "ClientGallery", required: true, index: true },
    albumId: { type: Schema.Types.ObjectId, ref: "GalleryAlbum", default: null, index: true },
    mediaId: { type: String, required: true },
    caption: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isCover: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default (models.GalleryImage as Model<IGalleryImage>) ||
  model<IGalleryImage>("GalleryImage", GalleryImageSchema);
