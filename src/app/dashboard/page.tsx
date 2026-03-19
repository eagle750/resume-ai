"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ResumeUploader } from "@/components/dashboard/ResumeUploader";
import { JobDescriptionInput } from "@/components/dashboard/JobDescriptionInput";
import { TailorButton } from "@/components/dashboard/TailorButton";
import { ATSScoreDisplay } from "@/components/dashboard/ATSScoreDisplay";
import { TailoredPreview } from "@/components/dashboard/TailoredPreview";
import { DownloadPDF } from "@/components/dashboard/DownloadPDF";
import { UsageCounter } from "@/components/dashboard/UsageCounter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FREE_TAILORS_PER_MONTH } from "@/lib/constants";
import type { TailorResult } from "@/lib/claude";
import type { Profile } from "@/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeFilename, setResumeFilename] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let supabase: ReturnType<typeof createClient>;
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
      const p = data as Profile | null;
      if (p?.base_resume_text) {
        setResumeText(p.base_resume_text);
        setResumeFilename(p.base_resume_filename || "");
      }
    }
    load();
  }, []);

  const handleTailor = useCallback(async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error("Please add your resume and paste a job description.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        if (data.limit_reached) {
          // Optionally redirect to pricing
        }
        setLoading(false);
        return;
      }
      setResult(data.data);
      toast.success("Resume tailored successfully.");
    } catch {
      toast.error("Request failed. Please try again.");
    }
    setLoading(false);
  }, [resumeText, jobDescription]);

  const limit =
    profile?.plan === "free"
      ? FREE_TAILORS_PER_MONTH
      : Infinity;
  const used = profile?.tailors_used_this_month ?? 0;
  const addWatermark = profile?.plan === "free";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tailor your resume</h1>
        <p className="text-muted-foreground mt-1">
          Upload your resume and paste a job description to get an ATS-optimized version.
        </p>
        {profile && (
          <div className="mt-2">
            <UsageCounter used={used} limit={limit} plan={profile.plan} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your resume</CardTitle>
          <CardDescription>
            Upload once; we’ll use it for every tailor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResumeUploader
            onTextExtracted={(text, filename) => {
              setResumeText(text);
              setResumeFilename(filename);
            }}
            currentText={resumeText}
            currentFilename={resumeFilename}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job description</CardTitle>
          <CardDescription>Paste the full job posting below.</CardDescription>
        </CardHeader>
        <CardContent>
          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
          />
          <div className="mt-4">
            <TailorButton
              onClick={handleTailor}
              loading={loading}
              disabled={!resumeText.trim() || !jobDescription.trim()}
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>ATS Score</CardTitle>
              <CardContent>
                <ATSScoreDisplay
                  score={result.ats_score}
                  breakdown={result.score_breakdown}
                  missingKeywords={result.missing_keywords}
                  suggestions={result.suggestions}
                />
              </CardContent>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tailored resume</CardTitle>
                <DownloadPDF
                  resume={result.tailored_sections}
                  addWatermark={addWatermark}
                />
              </div>
            </CardHeader>
            <CardContent>
              <TailoredPreview resume={result.tailored_sections} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
