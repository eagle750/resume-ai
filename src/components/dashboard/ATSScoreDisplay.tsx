"use client";

import { Progress } from "@/components/ui/progress";
import type { ScoreBreakdown } from "@/types";

interface ATSScoreDisplayProps {
  score: number;
  breakdown: ScoreBreakdown | null;
  missingKeywords?: string[];
  suggestions?: string[];
}

export function ATSScoreDisplay({
  score,
  breakdown,
  missingKeywords = [],
  suggestions = [],
}: ATSScoreDisplayProps) {
  const items = breakdown
    ? [
        { label: "Keyword match", value: breakdown.keyword_match },
        { label: "Skills coverage", value: breakdown.skills_coverage },
        { label: "Experience relevance", value: breakdown.experience_relevance },
        { label: "Formatting", value: breakdown.formatting_score },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          className="text-4xl font-bold tabular-nums"
          style={{
            color:
              score >= 80
                ? "var(--chart-1)"
                : score >= 60
                  ? "var(--chart-3)"
                  : "var(--destructive)",
          }}
        >
          {score}
        </div>
        <span className="text-muted-foreground">ATS Score</span>
      </div>
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-sm w-40 shrink-0">{item.label}</span>
              <Progress value={item.value} className="flex-1" />
              <span className="text-sm tabular-nums w-8">{item.value}%</span>
            </div>
          ))}
        </div>
      )}
      {missingKeywords.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-1">Missing keywords</h4>
          <p className="text-sm text-muted-foreground">
            {missingKeywords.slice(0, 15).join(", ")}
            {missingKeywords.length > 15 && " …"}
          </p>
        </div>
      )}
      {suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-1">Suggestions</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {suggestions.slice(0, 5).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
