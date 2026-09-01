import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { getSiteSettings, getNavigation } from "@/lib/site-data";
import { mediaUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()]);
  const logoUrl = mediaUrl(settings.logoMediaId);

  return (
    <div className="flex min-h-full w-full flex-1 flex-col">
      <Header navigation={navigation} settings={settings} logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer navigation={navigation} settings={settings} />
    </div>
  );
}
