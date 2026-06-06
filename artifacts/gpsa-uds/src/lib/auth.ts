import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole, Profile } from "@/types";

export type AuthUser = Profile;

/**
 * Returns the current user's full profile (from the `profiles` table),
 * with email overridden from the auth session (the authoritative source).
 * Returns null if not authenticated.
 *
 * Safe to call in Server Components — reads the session from cookies.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profileError || !profile) return null;

  // Email in auth.users is the source of truth; overwrite whatever is in profiles
  return { ...(profile as Profile), email: session.user.email ?? profile.email };
}

/**
 * Same as getCurrentUser but throws a redirect to /login if unauthenticated.
 * Use at the top of protected Server Components / page.tsx files.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Requires authentication AND that the user has one of the given roles.
 * Redirects to /login if unauthenticated, or to their correct dashboard
 * if they lack the required role.
 */
export async function requireRole(...roles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!roles.includes(user.role as UserRole)) {
    redirect(ROLE_DASHBOARDS[user.role] ?? "/dashboard/student");
  }

  return user;
}

/**
 * Convenience: true if the authenticated user holds any committee/admin role
 * (i.e. not a plain student). Returns false if not authenticated.
 */
export async function isStaff(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.role !== "student";
}

/**
 * Convenience: true if user is super_admin. Returns false if not authenticated.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "super_admin";
}

/** The set of staff roles (non-student) */
export const STAFF_ROLES: UserRole[] = [
  "super_admin",
  "treasurer",
  "academic",
  "welfare",
  "events",
  "opportunities",
  "ediboard",
];

/** Map each role to its dashboard path */
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  super_admin:   "/dashboard/admin",
  treasurer:     "/dashboard/treasurer",
  academic:      "/dashboard/academic",
  welfare:       "/dashboard/welfare",
  events:        "/dashboard/events",
  opportunities: "/dashboard/opportunities",
  ediboard:      "/dashboard/ediboard",
  student:       "/dashboard/student",
};
