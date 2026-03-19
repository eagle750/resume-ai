export interface JobData {
  title: string;
  company: string;
  description: string;
  url: string;
  site: "linkedin" | "indeed" | "naukri";
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro_india" | "pro_global";
  tailorsUsedThisMonth: number;
  baseResumeText: string | null;
  baseResumeFilename: string | null;
}

export interface TailorResult {
  id: string;
  tailored_sections: {
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
  };
  ats_score: number;
  score_breakdown: {
    keyword_match: number;
    skills_coverage: number;
    experience_relevance: number;
    formatting_score: number;
  };
  missing_keywords: string[];
  suggestions: string[];
  extracted_job_info: {
    company_name: string;
    job_title: string;
    key_requirements: string[];
  };
}

export type PopupState =
  | "loading"         // Checking auth + detecting job
  | "not_logged_in"   // User not logged into SaaS
  | "no_job"          // Not on a supported job listing page
  | "no_resume"       // User hasn't uploaded a base resume yet
  | "job_detected"    // JD found, ready to tailor
  | "tailoring"       // AI is processing
  | "result"          // Showing tailored result
  | "limit_reached"   // Free limit exhausted
  | "error";          // Something went wrong
