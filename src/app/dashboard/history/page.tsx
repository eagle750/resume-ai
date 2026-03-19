"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { TailoredResumeRecord } from "@/types";

export default function HistoryPage() {
  const [items, setItems] = useState<TailoredResumeRecord[]>([]);

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
        .from("tailored_resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setItems((data as TailoredResumeRecord[]) || []);
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tailoring history</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">
          No tailored resumes yet.{" "}
          <Link href="/dashboard" className="underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {item.job_title || "Untitled"} at {item.company_name || "Unknown"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()} · ATS: {item.ats_score ?? "—"}
                </p>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/dashboard?open=${item.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View details
                </Link>
              </CardContent>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
