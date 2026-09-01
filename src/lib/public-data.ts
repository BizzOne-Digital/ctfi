import { connectToDatabase } from "./db";
import ServiceModel, { type IService } from "@/models/Service";
import { DEFAULT_SERVICES } from "./constants";

function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export type PlainService = {
  _id: string;
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
};

export async function getActiveServices(): Promise<PlainService[]> {
  try {
    await connectToDatabase();
    const docs = await ServiceModel.find({ active: true }).sort({ order: 1 }).lean<IService[]>();
    if (!docs.length) {
      return DEFAULT_SERVICES.map((s, i) => ({ _id: `default-${i}`, galleryImageIds: [], ...s }));
    }
    return serialize(
      docs.map((d) => ({
        _id: String((d as unknown as { _id: unknown })._id),
        title: d.title,
        slug: d.slug,
        shortDescription: d.shortDescription,
        fullDescription: d.fullDescription,
        imageMediaId: d.imageMediaId,
        galleryImageIds: d.galleryImageIds,
        startingPrice: d.startingPrice,
        priceLabel: d.priceLabel,
        duration: d.duration,
        ctaText: d.ctaText,
        ctaLink: d.ctaLink,
        order: d.order,
        active: d.active,
      }))
    );
  } catch {
    return DEFAULT_SERVICES.map((s, i) => ({ _id: `default-${i}`, galleryImageIds: [], ...s }));
  }
}

export async function getServiceBySlug(slug: string): Promise<PlainService | null> {
  try {
    await connectToDatabase();
    const doc = await ServiceModel.findOne({ slug, active: true }).lean<IService>();
    if (!doc) return null;
    return serialize({
      _id: String((doc as unknown as { _id: unknown })._id),
      title: doc.title,
      slug: doc.slug,
      shortDescription: doc.shortDescription,
      fullDescription: doc.fullDescription,
      imageMediaId: doc.imageMediaId,
      galleryImageIds: doc.galleryImageIds,
      startingPrice: doc.startingPrice,
      priceLabel: doc.priceLabel,
      duration: doc.duration,
      ctaText: doc.ctaText,
      ctaLink: doc.ctaLink,
      order: doc.order,
      active: doc.active,
    });
  } catch {
    return null;
  }
}
