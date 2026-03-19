import type { ScoreBreakdown } from "@/types";

/**
 * Helper to compute a simple ATS score from keyword/skills match (for free tools without Claude).
 * The main ATS score comes from Claude in tailorResume().
 */
export function computeSimpleScore(
  resumeText: string,
  jobKeywords: string[]
): { score: number; breakdown: ScoreBreakdown } {
  const lower = resumeText.toLowerCase();
  const matched = jobKeywords.filter((k) => lower.includes(k.toLowerCase()));
  const keywordMatch = jobKeywords.length
    ? Math.round((matched.length / jobKeywords.length) * 100)
    : 50;
  const skillsCoverage = Math.min(100, keywordMatch + 10);
  const experienceRelevance = Math.min(100, keywordMatch + 5);
  const formattingScore = 85; // Assume decent formatting for pasted text
  const score = Math.round(
    (keywordMatch * 0.4 + skillsCoverage * 0.25 + experienceRelevance * 0.25 + formattingScore * 0.1)
  );
  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: {
      keyword_match: keywordMatch,
      skills_coverage: skillsCoverage,
      experience_relevance: experienceRelevance,
      formatting_score: formattingScore,
    },
  };
}
