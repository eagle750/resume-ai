import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { origin } = url;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  const oauthError = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const reason = oauthError ?? errorDescription ?? "auth_callback_error";
  const loginErrorUrl = `${origin}/login?error=auth_callback_error&reason=${encodeURIComponent(
    reason
  )}`;

  if (oauthError) {
    return NextResponse.redirect(loginErrorUrl);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_error&reason=${encodeURIComponent(
          (error as any)?.message ?? "code_exchange_failed"
        )}`
      );
    } catch (e) {
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_error&reason=${encodeURIComponent(
          (e as any)?.message ?? "code_exchange_exception"
        )}`
      );
    }
  }

  return NextResponse.redirect(loginErrorUrl);
}
