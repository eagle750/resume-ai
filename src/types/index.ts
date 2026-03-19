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
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  payment_provider: "razorpay" | "lemonsqueezy" | null;
  tailors_used_this_month: number;
  tailors_reset_date: string;
  base_resume_text: string | null;
  base_resume_filename: string | null;
  base_resume_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TailoredResumeRecord {
  id: string;
  user_id: string;
  job_description: string;
  company_name: string | null;
  job_title: string | null;
  original_resume_text: string;
  tailored_resume_json: TailoredResume;
  ats_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  missing_keywords: string[] | null;
  suggestions: string[] | null;
  template_used: string;
  pdf_url: string | null;
  created_at: string;
}
