"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        supabaseRef.current = createClient();
      } catch {
        // Env vars not set locally yet; keep user logged-out.
        supabaseRef.current = null;
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = supabaseRef.current;
    if (!supabase || !email) return;
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Check your email for the magic link.");
  };

  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to ResumeAI</CardTitle>
          <CardDescription>
            Use Google or a magic link sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">
              Authentication failed. Please try again.
            </p>
          )}
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
          <Button
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <form onSubmit={handleMagicLink} className="space-y-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
              Send magic link
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
