"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import type { UserRole } from "@/types";

// ─── Members ─────────────────────────────────────────────────────────────────

export async function updateMemberRole(userId: string, role: UserRole) {
  await requireRole("super_admin");
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/members");
}

export async function toggleMemberActive(userId: string, activate: boolean) {
  await requireRole("super_admin");
  const admin = createAdminClient();
  const { error } = activate
    ? await admin.auth.admin.updateUserById(userId, { ban_duration: "none" })
    : await admin.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/members");
}

// ─── Memberships ──────────────────────────────────────────────────────────────

export async function approveMembership(membershipId: string, userId: string) {
  await requireRole("super_admin", "treasurer");
  const supabase = await createClient();
  const admin = createAdminClient();
  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);

  const { data: { session } } = await supabase.auth.getSession();

  await admin
    .from("memberships")
    .update({
      status: "active",
      start_date: now.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
      verified_by: session?.user.id ?? null,
      verified_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", membershipId);

  await admin.from("notifications").insert({
    user_id: userId,
    title: "Membership Activated",
    body: "Your GPSA-UDS membership has been approved and activated. Welcome!",
    type: "membership",
  });

  revalidatePath("/dashboard/admin/memberships");
}

export async function rejectMembership(membershipId: string, userId: string) {
  await requireRole("super_admin", "treasurer");
  const admin = createAdminClient();
  await admin
    .from("memberships")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .eq("id", membershipId);

  await admin.from("notifications").insert({
    user_id: userId,
    title: "Membership Application Update",
    body: "Your membership application could not be approved at this time. Please contact the Treasurer for details.",
    type: "membership",
  });

  revalidatePath("/dashboard/admin/memberships");
}

// ─── Committee Accounts ───────────────────────────────────────────────────────

export async function createCommitteeAccount(formData: FormData) {
  await requireRole("super_admin");
  const email     = formData.get("email") as string;
  const password  = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;
  const role      = formData.get("role") as UserRole;

  if (!email || !password || !full_name || !role) throw new Error("All fields required.");

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) throw new Error(error.message);

  await admin.from("profiles").upsert({
    id: data.user.id,
    full_name,
    role,
    email,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/dashboard/admin/committees");
}

export async function resetCommitteePassword(userId: string, newPassword: string) {
  await requireRole("super_admin");
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.");
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) throw new Error(error.message);
}

export async function deactivateCommitteeAccount(userId: string) {
  await requireRole("super_admin");
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
  revalidatePath("/dashboard/admin/committees");
}

export async function reactivateCommitteeAccount(userId: string) {
  await requireRole("super_admin");
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });
  revalidatePath("/dashboard/admin/committees");
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function saveSiteSettings(settings: Record<string, string>) {
  await requireRole("super_admin");
  const supabase = await createClient();
  const upserts = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    label: key.replace(/_/g, " "),
  }));
  const { error } = await supabase
    .from("site_settings")
    .upsert(upserts, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/settings");
  revalidatePath("/");
}

// ─── Welfare Requests ─────────────────────────────────────────────────────────

export async function updateWelfareStatus(
  requestId: string,
  status: "under_review" | "approved" | "rejected" | "disbursed",
  reviewNote?: string
) {
  await requireRole("super_admin", "welfare");
  const supabase = await createClient();
  const now = new Date().toISOString();

  const updates: Record<string, string | null> = {
    status,
    updated_at: now,
  };
  if (status === "approved") updates.reviewed_at = now;
  if (reviewNote) updates.review_notes = reviewNote;

  const { error } = await supabase
    .from("welfare_requests")
    .update(updates)
    .eq("id", requestId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/welfare");
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function toggleEventStatus(
  eventId: string,
  status: "published" | "cancelled" | "completed" | "draft"
) {
  await requireRole("super_admin", "events");
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/events");
  revalidatePath("/events");
}

// ─── News ─────────────────────────────────────────────────────────────────────

export async function toggleNewsStatus(
  newsId: string,
  status: "published" | "draft" | "archived"
) {
  await requireRole("super_admin", "ediboard");
  const supabase = await createClient();
  const { error } = await supabase
    .from("news")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", newsId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/news");
  revalidatePath("/news");
}

// ─── Opportunities ────────────────────────────────────────────────────────────

export async function toggleOpportunityStatus(
  oppId: string,
  status: "published" | "draft" | "closed" | "archived"
) {
  await requireRole("super_admin", "opportunities");
  const supabase = await createClient();
  const { error } = await supabase
    .from("opportunities")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", oppId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/opportunities");
  revalidatePath("/opportunities");
}
