import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { getSiteSettings, getThemeSettings } from "@/lib/site-data";
import { mediaUrl } from "@/lib/utils";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const ogImage = mediaUrl(settings.ogImageMediaId);
  return {
    title: {
      default: settings.seoTitle || settings.businessName,
      template: `%s | ${settings.businessName}`,
    },
    description: settings.seoDescription,
    icons: settings.faviconMediaId ? { icon: mediaUrl(settings.faviconMediaId) } : undefined,
    openGraph: {
      title: settings.seoTitle || settings.businessName,
      description: settings.seoDescription,
      images: ogImage ? [{ url: ogImage }] : undefined,
      siteName: settings.businessName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle || settings.businessName,
      description: settings.seoDescription,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getThemeSettings();

  const radiusMap: Record<string, string> = {
    none: "0px",
    small: "0.375rem",
    medium: "0.625rem",
    large: "1.25rem",
  };

  const themeStyle = `:root{
    --color-background:${theme.colorBackground};
    --color-foreground:${theme.colorForeground};
    --color-primary:${theme.colorPrimary};
    --color-primary-dark:${theme.colorPrimary}cc;
    --color-secondary:${theme.colorSecondary};
    --color-accent:${theme.colorAccent};
    --color-muted:${theme.colorMuted};
    --radius-button:${
      theme.buttonStyle === "pill" ? "999px" : theme.buttonStyle === "square" ? "0px" : radiusMap[theme.borderRadius]
    };
    --font-heading:${theme.headingFont === "sans" ? "var(--font-inter)" : "var(--font-playfair)"};
    --font-body: var(--font-inter);
  }`;

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeStyle }} />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
