import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/login",
  "/join",
  "/welfare",
  "/resources",
  "/forgot-password",
  "/reset-password",
];

const PUBLIC_PREFIXES = ["/events", "/news", "/opportunities", "/api/paystack"];

const ROLE_DASHBOARDS: Record<string, string> = {
  super_admin:   "/dashboard/admin",
  treasurer:     "/dashboard/treasurer",
  academic:      "/dashboard/academic",
  welfare:       "/dashboard/welfare",
  events:        "/dashboard/events",
  opportunities: "/dashboard/opportunities",
  ediboard:      "/dashboard/ediboard",
  student:       "/dashboard/student",
};

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a response we can mutate (for cookie refresh)
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create a Supabase client that can read/write cookies through middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh session — this is the key call that keeps sessions alive
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ── Public route — let through (still refreshes session cookie) ──────────
  if (isPublic(pathname)) {
    // If logged-in user hits /login, redirect to their dashboard
    if (pathname === "/login" && session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const role = (profile?.role as string) ?? "student";
      const dest = ROLE_DASHBOARDS[role] ?? "/dashboard/student";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return response;
  }

  // ── Protected route — must be authenticated ───────────────────────────────
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Role-gated sub-dashboard paths ────────────────────────────────────────
  // e.g. /dashboard/treasurer should only be accessible by treasurer / super_admin
  if (pathname.startsWith("/dashboard/")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const role = (profile?.role as string) ?? "student";

    // /dashboard (bare) → redirect to correct sub-dashboard
    if (pathname === "/dashboard") {
      const dest = ROLE_DASHBOARDS[role] ?? "/dashboard/student";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Super-admin can go anywhere
    if (role === "super_admin") return response;

    // /dashboard/student — any authenticated user can access
    if (pathname.startsWith("/dashboard/student")) return response;

    // Role-specific gates
    const dashboardRole = pathname.split("/")[2]; // e.g. "treasurer"
    if (dashboardRole && role !== dashboardRole) {
      // Wrong section — redirect to own dashboard
      const dest = ROLE_DASHBOARDS[role] ?? "/dashboard/student";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, site assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
