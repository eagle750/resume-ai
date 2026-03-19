"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  plan: string;
  tailorsUsedThisMonth: number | null;
  tailorsResetDate: string | null;
  baseResumeText: string | null;
  baseResumeFilename: string | null;
  baseResumeUrl: string | null;
  subscriptionStatus: string | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeFilename, setResumeFilename] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TailorResult | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data: UserProfile) => {
        setProfile(data);
        if (data.baseResumeText) {
          setResumeText(data.baseResumeText);
          setResumeFilename(data.baseResumeFilename || "");
        }
      })
      .catch(() => {});
  }, [session?.user?.id]);

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
  const used = profile?.tailorsUsedThisMonth ?? 0;
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
            Upload once; we'll use it for every tailor.
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
