import { requireRole } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/Header";

export const metadata = { title: "Admin Dashboard | GPSA-UDS" };

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("super_admin");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
