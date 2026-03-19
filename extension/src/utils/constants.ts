// CHANGE THIS to your production domain when ready
export const API_BASE_URL = "https://resume-ai-tan.vercel.app";

export const ROUTES = {
  checkAuth: `${API_BASE_URL}/api/auth/session`,
  getProfile: `${API_BASE_URL}/api/user/profile`,
  tailorResume: `${API_BASE_URL}/api/tailor`,
  generatePdf: `${API_BASE_URL}/api/generate-pdf`,
  pricing: `${API_BASE_URL}/pricing`,
  dashboard: `${API_BASE_URL}/dashboard`,
  login: `${API_BASE_URL}/login`,
} as const;

export const FREE_LIMIT = 3;

export const SUPPORTED_SITES = {
  LINKEDIN: "linkedin",
  INDEED: "indeed",
  NAUKRI: "naukri",
} as const;
