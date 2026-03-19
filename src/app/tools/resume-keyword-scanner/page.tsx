"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function KeywordScannerPage() {
  const [jdText, setJdText] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const extractKeywords = (text: string): string[] => {
    const stop = new Set(["the", "and", "for", "with", "this", "that", "from", "have", "will", "your", "are", "not", "can", "but", "you", "all", "our", "they", "their", "been", "has", "was", "were", "being", "be", "is", "to", "of", "in", "on", "at", "by", "a", "an", "as", "or", "if", "it", "we", "so", "experience", "required", "preferred", "ability", "skills"]);
    const words = text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !stop.has(w));
    const counts = new Map<string, number>();
    words.forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([w]) => w);
  };

  const handleScan = () => {
    if (!jdText.trim()) return;
    setKeywords(extractKeywords(jdText));
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Resume keyword scanner</h1>
      <p className="text-muted-foreground mb-8">
        Extract likely keywords from a job description so you can add them to your resume.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Job description</CardTitle>
          <CardDescription>Paste the job posting</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste job description here…"
            className="min-h-[200px]"
          />
        </CardContent>
      </Card>

      <Button onClick={handleScan} disabled={!jdText.trim()} className="mb-8">
        Extract keywords
      </Button>

      {keywords.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Keywords to consider</CardTitle>
            <CardDescription>Weave these into your resume where accurate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywords.map((k) => (
                <Badge key={k} variant="secondary">{k}</Badge>
              ))}
            </div>
            <Link href="/signup" className="inline-block mt-4 text-primary font-medium hover:underline">
              Tailor your resume with AI →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
