export const FREE_TAILORS_PER_MONTH = 3;
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "ResumeAI";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const PLANS = {
  free: {
    name: "Free",
    tailorsPerMonth: 3,
    templates: 1,
    watermark: true,
    price: null,
  },
  pro: {
    name: "Pro",
    tailorsPerMonth: Infinity,
    templates: -1, // all
    watermark: false,
    price: 399,
  },
} as const;

export const TEMPLATES = ["clean", "modern", "minimal"] as const;
