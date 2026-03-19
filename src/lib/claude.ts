import Anthropic from "@anthropic-ai/sdk";
import type { TailoredResume, TailorResult } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type { TailoredResume, TailorResult };

export async function tailorResume(
  resumeText: string,
  jobDescription: string
): Promise<TailorResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are an elite resume optimization specialist with deep expertise in ATS systems (Workday, Greenhouse, Lever, Taleo).

TASK: Rewrite the candidate's resume to perfectly match the target job description.

STRICT RULES:
1. NEVER invent experience, skills, degrees, or achievements. Only rephrase EXISTING content from the resume.
2. Rewrite bullets in ACTION VERB + QUANTIFIED METRIC + RESULT format. Example: "Reduced API latency by 40% through Redis caching, improving user retention by 12%"
3. Extract ALL important keywords from the JD (technical skills, tools, methodologies, soft skills) and weave them naturally into the resume content.
4. Reorder experience bullets so the most JD-relevant ones come first within each role.
5. The summary must be 2-3 sentences that directly address the JD's top requirements.
6. Skills section must list matching skills first, grouped by category.
7. Score the resume honestly. An ATS score of 85+ means strong keyword match, clear formatting, and relevant experience highlighted.

CANDIDATE RESUME:
---
${resumeText}
---

JOB DESCRIPTION:
---
${jobDescription}
---

Respond with ONLY valid JSON (no markdown backticks, no explanation):
{
  "tailored_sections": {
    "summary": "2-3 sentence professional summary tailored to this JD",
    "experience": [
      {
        "title": "Job Title from original resume",
        "company": "Company Name",
        "duration": "Start - End",
        "bullets": ["ACTION VERB + metric + result bullet 1", "bullet 2", "bullet 3"]
      }
    ],
    "skills": ["skill1", "skill2"],
    "education": [{"degree": "...", "institution": "...", "year": "..."}],
    "certifications": ["cert1"]
  },
  "ats_score": 87,
  "score_breakdown": {
    "keyword_match": 90,
    "skills_coverage": 85,
    "experience_relevance": 88,
    "formatting_score": 95
  },
  "missing_keywords": ["keywords from JD not in resume"],
  "suggestions": ["actionable improvement tips"],
  "extracted_job_info": {
    "company_name": "...",
    "job_title": "...",
    "key_requirements": ["req1", "req2"]
  }
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned) as TailorResult;
  } catch {
    throw new Error("Failed to parse Claude response");
  }
}
