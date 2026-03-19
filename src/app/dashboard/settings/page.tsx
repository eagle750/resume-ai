"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Profile } from "@/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let supabase: ReturnType<typeof createClient> | null = null;
    try {
      supabase = createClient();
    } catch {
      return;
    }
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data as Profile);
    }
    load();
  }, []);

  if (!profile) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Email and plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Email:</span> {profile.email ?? "—"}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Plan:</span>{" "}
            <Badge variant={profile.plan === "free" ? "secondary" : "default"}>
              {profile.plan === "pro_india" ? "Pro India" : profile.plan === "pro_global" ? "Pro Global" : "Free"}
            </Badge>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Upgrade for unlimited tailors and no watermark</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.plan === "free" ? (
            <div className="flex flex-wrap gap-2">
              <Link href="/pricing">
                <Button>View plans</Button>
              </Link>
              <p className="text-sm text-muted-foreground w-full">
                Pro India: ₹499/month · Pro Global: $9/month
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your subscription is active. Manage payment in your payment provider dashboard.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
