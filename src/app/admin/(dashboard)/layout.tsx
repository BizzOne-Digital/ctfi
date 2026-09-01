import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { getAdminSessionFromCookies } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSessionFromCookies();
  // Defense in depth — middleware already redirects unauthenticated visitors,
  // this covers the layout being rendered in any other context.
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar name={session.name} email={session.email} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
