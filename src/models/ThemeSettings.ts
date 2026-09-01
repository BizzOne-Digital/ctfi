import { Schema, models, model, type Document, type Model } from "mongoose";

export interface IThemeSettings extends Document {
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorForeground: string;
  colorMuted: string;
  buttonStyle: "rounded" | "pill" | "square";
  borderRadius: "none" | "small" | "medium" | "large";
  headingFont: "serif" | "sans";
  headerStyle: "standard" | "transparent";
  heroStyle: "full" | "split";
  sectionSpacing: "compact" | "comfortable" | "spacious";
  updatedAt: Date;
}

const ThemeSettingsSchema = new Schema<IThemeSettings>(
  {
    colorPrimary: { type: String, default: "#9C5A34" },
    colorSecondary: { type: String, default: "#E9DCC5" },
    colorAccent: { type: String, default: "#C08A4E" },
    colorBackground: { type: String, default: "#FBF6EF" },
    colorForeground: { type: String, default: "#2B2420" },
    colorMuted: { type: String, default: "#8A7B6C" },
    buttonStyle: { type: String, enum: ["rounded", "pill", "square"], default: "rounded" },
    borderRadius: { type: String, enum: ["none", "small", "medium", "large"], default: "medium" },
    headingFont: { type: String, enum: ["serif", "sans"], default: "serif" },
    headerStyle: { type: String, enum: ["standard", "transparent"], default: "standard" },
    heroStyle: { type: String, enum: ["full", "split"], default: "full" },
    sectionSpacing: {
      type: String,
      enum: ["compact", "comfortable", "spacious"],
      default: "comfortable",
    },
  },
  { timestamps: true }
);

export default (models.ThemeSettings as Model<IThemeSettings>) ||
  model<IThemeSettings>("ThemeSettings", ThemeSettingsSchema);
