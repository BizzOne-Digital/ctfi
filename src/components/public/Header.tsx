"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { PlainNavItem, PlainSiteSettings } from "@/lib/site-data";

export function Header({
  navigation,
  settings,
  logoUrl,
}: {
  navigation: PlainNavItem[];
  settings: PlainSiteSettings;
  logoUrl: string;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setOpen(false), [pathname]);

  const bookLink = navigation.find((n) => n.url === "/book");
  const primaryNav = navigation.filter((n) => n.url !== "/book");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${settings.businessName} home`}>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={settings.businessName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <Camera className="h-5 w-5" />
            </span>
          )}
          <span className="font-heading text-lg font-semibold leading-tight text-foreground sm:text-xl">
            {settings.businessName}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {primaryNav.map((item) => (
            <Link
              key={item._id}
              href={item.url}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noopener noreferrer" : undefined}
              className={cn(
                "text-sm font-medium text-foreground/80 transition-colors hover:text-primary",
                pathname === item.url && "text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href={bookLink?.url ?? "/book"} size="sm">
            {bookLink?.label ?? "Book Appointment"}
          </Button>
        </div>

        <button
          className="rounded-md p-2 text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-border bg-background px-4 pb-5 pt-2 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {navigation.map((item) => (
              <li key={item._id}>
                <Link
                  href={item.url}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-secondary",
                    pathname === item.url && "bg-secondary text-primary"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
