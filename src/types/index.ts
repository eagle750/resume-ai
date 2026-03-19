export interface TailoredResume {
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    bullets: string[];
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications?: string[];
}

export interface ScoreBreakdown {
  keyword_match: number;
  skills_coverage: number;
  experience_relevance: number;
  formatting_score: number;
}

export interface TailorResult {
  tailored_sections: TailoredResume;
  ats_score: number;
  score_breakdown: ScoreBreakdown;
  missing_keywords: string[];
  suggestions: string[];
  extracted_job_info: {
    company_name: string;
    job_title: string;
    key_requirements: string[];
  };
}

export type Plan = "free" | "pro_india" | "pro_global";
export type SubscriptionStatus = "inactive" | "active" | "cancelled" | "past_due";

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  plan: Plan;
  subscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  paymentProvider: "razorpay" | "lemonsqueezy" | null;
  tailorsUsedThisMonth: number;
  tailorsResetDate: Date | null;
  baseResumeText: string | null;
  baseResumeFilename: string | null;
  baseResumeUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface TailoredResumeRecord {
  id: string;
  userId: string;
  jobDescription: string;
  companyName: string | null;
  jobTitle: string | null;
  originalResumeText: string;
  tailoredResumeJson: TailoredResume;
  atsScore: number | null;
  scoreBreakdown: ScoreBreakdown | null;
  missingKeywords: string[] | null;
  suggestions: string[] | null;
  templateUsed: string | null;
  pdfUrl: string | null;
  createdAt: Date | null;
}
