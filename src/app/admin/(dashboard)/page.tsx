import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { getDashboardStats } from "@/lib/admin-data";
import { formatCalendarDateShort, formatTime12h } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "primary"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  rescheduled: "primary",
  completed: "success",
  cancelled: "danger",
  unread: "primary",
  read: "neutral",
  contacted: "success",
  archived: "neutral",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">A quick overview of everything happening on your site.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Appointments" value={stats.totalAppointments} href="/admin/appointments" />
        <StatCard
          label="Pending Appointments"
          value={stats.pendingAppointments}
          href="/admin/appointments?status=pending"
          tone="warning"
        />
        <StatCard label="Total Services" value={stats.totalServices} href="/admin/services" />
        <StatCard label="Total Galleries" value={stats.totalGalleries} href="/admin/galleries" />
        <StatCard label="Total Images" value={stats.totalImages} href="/admin/media" />
        <StatCard label="Unread Messages" value={stats.unreadMessages} href="/admin/messages" tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-foreground">Recent Appointments</h2>
            <Link href="/admin/appointments" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {stats.recentAppointments.length === 0 ? (
            <EmptyState title="No appointments yet" />
          ) : (
            <ul className="space-y-3">
              {stats.recentAppointments.map((a) => (
                <li key={a._id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{a.fullName}</p>
                    <p className="text-muted">
                      {a.serviceName} · {formatCalendarDateShort(a.preferredDate)} at {formatTime12h(a.preferredTime)}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[a.status] ?? "neutral"}>{a.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-foreground">Recent Inquiries</h2>
            <Link href="/admin/messages" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {stats.recentMessages.length === 0 ? (
            <EmptyState title="No messages yet" />
          ) : (
            <ul className="space-y-3">
              {stats.recentMessages.map((m) => (
                <li key={m._id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{m.name}</p>
                    <p className="truncate text-muted">{m.subject}</p>
                  </div>
                  <Badge tone={STATUS_TONE[m.status] ?? "neutral"}>{m.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-foreground">Recent Galleries</h2>
            <Link href="/admin/galleries" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {stats.recentGalleries.length === 0 ? (
            <EmptyState title="No galleries yet" />
          ) : (
            <ul className="space-y-3">
              {stats.recentGalleries.map((g) => (
                <li key={g._id} className="text-sm">
                  <p className="font-medium text-foreground">{g.name}</p>
                  <p className="text-muted">{g.clientName}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
