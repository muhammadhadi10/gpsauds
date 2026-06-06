import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Clears the Supabase session and redirects to /login.
 */
export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    { status: 302 }
  );
}
