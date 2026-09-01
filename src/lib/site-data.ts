import { connectToDatabase } from "./db";
import SiteSettingsModel, { type ISiteSettings } from "@/models/SiteSettings";
import ThemeSettingsModel, { type IThemeSettings } from "@/models/ThemeSettings";
import NavigationItemModel, { type INavigationItem } from "@/models/NavigationItem";
import PageContentModel, { type IPageSection } from "@/models/PageContent";
import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_THEME,
  DEFAULT_NAVIGATION,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_ABOUT_SECTIONS,
  type ThemeShape,
} from "./constants";

export type PlainSiteSettings = typeof DEFAULT_SITE_SETTINGS & { _id?: string };
export type PlainTheme = ThemeShape & { _id?: string };
export type PlainNavItem = { _id: string; label: string; url: string; order: number; visible: boolean; openInNewTab: boolean };

function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

/** Safe getter: returns DB values, or shipped defaults if the DB is unreachable/empty. */
export async function getSiteSettings(): Promise<PlainSiteSettings> {
  try {
    await connectToDatabase();
    const doc = await SiteSettingsModel.findOne().lean<ISiteSettings>();
    if (!doc) return DEFAULT_SITE_SETTINGS;
    return serialize({ ...DEFAULT_SITE_SETTINGS, ...doc, _id: String((doc as unknown as { _id: unknown })._id) });
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getThemeSettings(): Promise<PlainTheme> {
  try {
    await connectToDatabase();
    const doc = await ThemeSettingsModel.findOne().lean<IThemeSettings>();
    if (!doc) return DEFAULT_THEME;
    return serialize({ ...DEFAULT_THEME, ...doc, _id: String((doc as unknown as { _id: unknown })._id) });
  } catch {
    return DEFAULT_THEME;
  }
}

export async function getNavigation(): Promise<PlainNavItem[]> {
  try {
    await connectToDatabase();
    const docs = await NavigationItemModel.find({ visible: true }).sort({ order: 1 }).lean<INavigationItem[]>();
    if (!docs.length) {
      return DEFAULT_NAVIGATION.map((n, i) => ({ _id: `default-${i}`, ...n }));
    }
    return serialize(
      docs.map((d) => ({
        _id: String((d as unknown as { _id: unknown })._id),
        label: d.label,
        url: d.url,
        order: d.order,
        visible: d.visible,
        openInNewTab: d.openInNewTab,
      }))
    );
  } catch {
    return DEFAULT_NAVIGATION.map((n, i) => ({ _id: `default-${i}`, ...n }));
  }
}

export async function getPageSections(page: "home" | "about"): Promise<IPageSection[]> {
  const fallback = page === "home" ? DEFAULT_HOME_SECTIONS : DEFAULT_ABOUT_SECTIONS;
  try {
    await connectToDatabase();
    const doc = await PageContentModel.findOne({ page }).lean();
    if (!doc || !doc.sections?.length) return fallback as unknown as IPageSection[];
    return serialize(doc.sections) as IPageSection[];
  } catch {
    return fallback as unknown as IPageSection[];
  }
}

export function findSection(sections: IPageSection[], key: string): IPageSection | undefined {
  return sections.find((s) => s.key === key && s.visible !== false);
}
