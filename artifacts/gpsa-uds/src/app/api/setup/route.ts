import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { UserRole } from "@/types";

/**
 * POST /api/setup
 * One-time endpoint to seed initial committee accounts.
 * Protected by ADMIN_SETUP_SECRET — must be included as
 * the `Authorization: Bearer <secret>` header.
 *
 * Body JSON:
 * {
 *   "accounts": [
 *     { "email": "president@gpsa-uds.org", "password": "...", "full_name": "...", "role": "super_admin" },
 *     ...
 *   ]
 * }
 */

interface AccountInput {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  student_id?: string;
  phone?: string;
}

export async function POST(req: Request) {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const secret = process.env.ADMIN_SETUP_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Setup endpoint is disabled (ADMIN_SETUP_SECRET not set)." },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/, "");

  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let accounts: AccountInput[];
  try {
    const body = await req.json();
    accounts = body.accounts;
    if (!Array.isArray(accounts) || accounts.length === 0) throw new Error();
  } catch {
    return NextResponse.json(
      { error: "Body must be JSON with an `accounts` array." },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminClient();
  const results: Array<{ email: string; status: string; error?: string }> = [];

  for (const account of accounts) {
    const { email, password, full_name, role, student_id, phone } = account;

    if (!email || !password || !full_name || !role) {
      results.push({
        email: email ?? "?",
        status: "skipped",
        error: "Missing required fields (email, password, full_name, role).",
      });
      continue;
    }

    // 1. Create auth user
    const { data: authData, error: authError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      results.push({
        email,
        status: "error",
        error: authError?.message ?? "Unknown auth error.",
      });
      continue;
    }

    // 2. Upsert profile with role
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .upsert(
        {
          id: authData.user.id,
          full_name,
          role,
          student_id: student_id ?? null,
          phone: phone ?? null,
          membership_status: role === "student" ? "pending" : "active",
        },
        { onConflict: "id" }
      );

    if (profileError) {
      results.push({
        email,
        status: "auth_ok_profile_error",
        error: profileError.message,
      });
      continue;
    }

    results.push({ email, status: "created" });
  }

  const allOk = results.every((r) => r.status === "created");
  return NextResponse.json(
    {
      message: allOk
        ? "All accounts created successfully."
        : "Some accounts had errors.",
      results,
    },
    { status: allOk ? 200 : 207 }
  );
}
