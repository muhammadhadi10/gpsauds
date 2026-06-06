import { requireAuth } from "@/lib/auth";

/**
 * Root dashboard layout — only requires authentication.
 * Role-specific sub-layouts (admin, student, etc.) add their own shells.
 */
export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
