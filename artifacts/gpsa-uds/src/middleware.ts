import { createServerClient } from "@supabase/ssr";
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

  let response = NextResponse.next({ request });

  // Supabase client that reads/writes cookies through middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — keeps sessions alive
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ── Public route ──────────────────────────────────────────────────────────
  if (isPublic(pathname)) {
    // Logged-in user hitting /login → redirect to their dashboard
    if (pathname === "/login" && session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const role = (profile?.role as string) ?? "student";
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role] ?? "/dashboard/student", request.url));
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
  if (pathname.startsWith("/dashboard/")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const role = (profile?.role as string) ?? "student";

    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role] ?? "/dashboard/student", request.url));
    }

    // Super-admin can access any dashboard
    if (role === "super_admin") return response;

    // Any authenticated user can access /dashboard/student
    if (pathname.startsWith("/dashboard/student")) return response;

    // Redirect to own dashboard if accessing wrong role's section
    const dashboardRole = pathname.split("/")[2];
    if (dashboardRole && role !== dashboardRole) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role] ?? "/dashboard/student", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
