"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ATSScoreDisplay } from "@/components/dashboard/ATSScoreDisplay";
import { computeSimpleScore } from "@/lib/scoring";
import Link from "next/link";

export default function ATSScoreCheckerPage() {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<{ score: number; breakdown: ReturnType<typeof computeSimpleScore>["breakdown"] } | null>(null);
  const [loading, setLoading] = useState(false);

  const extractKeywords = (text: string): string[] => {
    const stop = new Set(["the", "and", "for", "with", "this", "that", "from", "have", "will", "your", "are", "not", "can", "but", "you", "all", "our", "they", "their", "been", "has", "was", "were", "being", "be", "is", "to", "of", "in", "on", "at", "by", "a", "an", "as", "or", "if", "it", "we", "so"]);
    const words = text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !stop.has(w));
    const counts = new Map<string, number>();
    words.forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50).map(([w]) => w);
  };

  const handleCheck = () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    setLoading(true);
    const keywords = extractKeywords(jdText);
    const { score, breakdown } = computeSimpleScore(resumeText, keywords);
    setResult({ score, breakdown });
    setLoading(false);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">ATS Score Checker</h1>
      <p className="text-muted-foreground mb-8">
        Paste your resume and a job description to get an approximate ATS match score. This is a quick estimate; sign up to get a full AI-tailored resume and accurate score.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your resume</CardTitle>
          <CardDescription>Paste the text of your resume</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste resume text here…"
            className="min-h-[160px]"
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Job description</CardTitle>
          <CardDescription>Paste the full job posting</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste job description here…"
            className="min-h-[160px]"
          />
        </CardContent>
      </Card>

      <Button onClick={handleCheck} disabled={!resumeText.trim() || !jdText.trim() || loading} className="mb-8">
        {loading ? "Checking…" : "Check ATS score"}
      </Button>

      {result && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your score (estimate)</CardTitle>
            <CardDescription>Sign up to get the full tailored resume and PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <ATSScoreDisplay score={result.score} breakdown={result.breakdown} />
            <Link href="/signup" className="inline-block mt-4 text-primary font-medium hover:underline">
              Get full tailored resume →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
