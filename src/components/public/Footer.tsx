import Link from "next/link";
import Image from "next/image";
import { Camera, Mail, Phone } from "lucide-react";
import { InstagramIcon, FacebookIcon, XIcon } from "@/components/icons/SocialIcons";
import { Container } from "@/components/ui/Container";
import type { PlainNavItem, PlainSiteSettings } from "@/lib/site-data";

export function Footer({
  navigation,
  settings,
  logoUrl,
}: {
  navigation: PlainNavItem[];
  settings: PlainSiteSettings;
  logoUrl?: string;
}) {
  const year = new Date().getFullYear();
  const socials = [
    { href: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { href: settings.facebookUrl, label: "Facebook", Icon: FacebookIcon },
    { href: settings.xUrl, label: "X (Twitter)", Icon: XIcon },
  ].filter((s) => s.href);

  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={settings.businessName}
              width={260}
              height={151}
              className="h-16 w-auto object-contain sm:h-20"
            />
          ) : (
            <div className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
              <Camera className="h-5 w-5 text-primary" />
              {settings.businessName}
            </div>
          )}
          <p className="mt-3 max-w-sm text-sm text-muted">{settings.footerText}</p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">
            Navigate
          </h3>
          <ul className="mt-4 space-y-2.5">
            {navigation.map((item) => (
              <li key={item._id}>
                <Link href={item.url} className="text-sm text-muted hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">
            Contact
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {settings.phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-primary">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${settings.email}`} className="hover:text-primary break-all">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-5 text-center text-xs text-muted">
        © {year} {settings.copyrightText}
      </div>
    </footer>
  );
}
