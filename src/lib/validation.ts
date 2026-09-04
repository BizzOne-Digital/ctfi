import { z } from "zod";

const phoneRegex = /^[0-9+()\-.\s]{7,20}$/;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Please enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().min(2, "Please add a subject.").max(150),
  message: z.string().trim().min(10, "Please tell us a bit more (10+ characters).").max(3000),
  preferredDate: z.string().trim().optional().or(z.literal("")),
  serviceId: z.string().trim().optional().or(z.literal("")),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const appointmentSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().regex(phoneRegex, "Please enter a valid phone number."),
  serviceId: z.string().trim().min(1, "Please choose a service."),
  preferredDate: z.string().trim().min(1, "Please choose a date."),
  preferredTime: z.string().trim().min(1, "Please choose a time."),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const galleryLoginSchema = z.object({
  slug: z.string().trim().min(1),
  password: z.string().min(1, "Please enter the gallery password."),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens."),
  shortDescription: z.string().trim().min(2).max(280),
  fullDescription: z.string().trim().max(5000).optional().or(z.literal("")),
  imageMediaId: z.string().trim().optional().or(z.literal("")),
  galleryImageIds: z.array(z.string()).optional().default([]),
  startingPrice: z.coerce.number().nonnegative().optional().nullable(),
  priceLabel: z.string().trim().max(60).optional().or(z.literal("")),
  duration: z.string().trim().max(60).optional().or(z.literal("")),
  ctaText: z.string().trim().max(60).optional().or(z.literal("")),
  ctaLink: z.string().trim().max(200).optional().or(z.literal("")),
  order: z.coerce.number().int().optional().default(0),
  active: z.boolean().optional().default(true),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const gallerySchema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/),
  clientName: z.string().trim().min(1).max(140),
  clientEmail: z.string().trim().email().optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  passwordProtected: z.boolean().optional().default(true),
  password: z.string().min(4, "Password must be at least 4 characters.").optional().or(z.literal("")),
  coverImageMediaId: z.string().trim().optional().or(z.literal("")),
  expirationDate: z.string().trim().optional().or(z.literal("")),
  active: z.boolean().optional().default(true),
  allowDownloads: z.boolean().optional().default(true),
  allowSharing: z.boolean().optional().default(false),
});
export type GalleryInput = z.infer<typeof gallerySchema>;

export const albumSchema = z.object({
  name: z.string().trim().min(1).max(140),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  order: z.coerce.number().int().optional().default(0),
});

export const availabilitySchema = z.object({
  workingDays: z.array(z.number().int().min(0).max(6)),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  appointmentDurationMinutes: z.coerce.number().int().min(5).max(600),
  bufferMinutes: z.coerce.number().int().min(0).max(240),
  breaks: z
    .array(
      z.object({
        start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      })
    )
    .optional()
    .default([]),
  closedDates: z.array(z.string()).optional().default([]),
  bookingEnabled: z.boolean().optional().default(true),
});
export type AvailabilityInput = z.infer<typeof availabilitySchema>;

export const siteSettingsSchema = z.object({
  businessName: z.string().trim().min(1).max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  instagramUrl: z.string().trim().max(300).optional().or(z.literal("")),
  facebookUrl: z.string().trim().max(300).optional().or(z.literal("")),
  xUrl: z.string().trim().max(300).optional().or(z.literal("")),
  tiktokUrl: z.string().trim().max(300).optional().or(z.literal("")),
  logoMediaId: z.string().trim().optional().or(z.literal("")),
  faviconMediaId: z.string().trim().optional().or(z.literal("")),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  ogImageMediaId: z.string().trim().optional().or(z.literal("")),
  footerText: z.string().trim().max(500).optional().or(z.literal("")),
  copyrightText: z.string().trim().max(200).optional().or(z.literal("")),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const themeSettingsSchema = z.object({
  colorPrimary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorBackground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorForeground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorMuted: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  buttonStyle: z.enum(["rounded", "pill", "square"]),
  borderRadius: z.enum(["none", "small", "medium", "large"]),
  headingFont: z.enum(["serif", "sans"]),
  headerStyle: z.enum(["standard", "transparent"]),
  heroStyle: z.enum(["full", "split"]),
  sectionSpacing: z.enum(["compact", "comfortable", "spacious"]),
});
export type ThemeSettingsInput = z.infer<typeof themeSettingsSchema>;

export const navigationItemSchema = z.object({
  label: z.string().trim().min(1).max(60),
  url: z.string().trim().min(1).max(300),
  order: z.coerce.number().int().optional().default(0),
  visible: z.boolean().optional().default(true),
  openInNewTab: z.boolean().optional().default(false),
});

export const pageSectionSchema = z.object({
  key: z.string().trim().min(1),
  order: z.coerce.number().int().optional().default(0),
  visible: z.boolean().optional().default(true),
  heading: z.string().trim().max(200).optional().or(z.literal("")),
  subheading: z.string().trim().max(400).optional().or(z.literal("")),
  body: z.string().trim().max(5000).optional().or(z.literal("")),
  ctaText: z.string().trim().max(60).optional().or(z.literal("")),
  ctaLink: z.string().trim().max(300).optional().or(z.literal("")),
  imageMediaId: z.string().trim().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        title: z.string().trim().max(140).optional().or(z.literal("")),
        description: z.string().trim().max(600).optional().or(z.literal("")),
        imageMediaId: z.string().trim().optional().or(z.literal("")),
        icon: z.string().trim().max(60).optional().or(z.literal("")),
      })
    )
    .optional()
    .default([]),
});

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
