"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Camera,
  CalendarDays,
  Images,
  FolderOpen,
  MessageSquare,
  Settings,
  Palette,
  Menu as MenuIcon,
  X,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/content/home", label: "Home Page", icon: FileText },
  { href: "/admin/content/about", label: "About Page", icon: FileText },
  { href: "/admin/services", label: "Services", icon: Camera },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/galleries", label: "Client Galleries", icon: FolderOpen },
  { href: "/admin/media", label: "Media Library", icon: Images },
  { href: "/admin/messages", label: "Contact Messages", icon: MessageSquare },
  { href: "/admin/navigation", label: "Navigation", icon: Compass },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/theme", label: "Theme & Appearance", icon: Palette },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-white" : "text-foreground/80 hover:bg-secondary"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex items-center gap-2 border-b border-border px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
            <Camera className="h-5 w-5" />
          </span>
          <span className="font-heading text-base font-semibold text-foreground">CTFI Admin</span>
        </div>
        <NavLinks />
      </aside>

      <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-foreground hover:bg-secondary"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <span className="font-heading text-base font-semibold text-foreground">CTFI Admin</span>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative flex w-72 flex-col bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="font-heading text-base font-semibold text-foreground">CTFI Admin</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-md p-1.5 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
