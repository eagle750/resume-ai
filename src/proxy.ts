import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic check: just verify the session cookie exists.
// Do NOT call auth() here — it hits the database, which is not allowed in proxy.
// Real session verification happens in server components via auth().
export function proxy(req: NextRequest) {
  const sessionToken =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!sessionToken;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
