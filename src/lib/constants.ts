export const FREE_TAILORS_PER_MONTH = 3;
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "ResumeAI";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const PLANS = {
  free: {
    name: "Free",
    tailorsPerMonth: 3,
    templates: 1,
    watermark: true,
    priceIndia: null,
    priceGlobal: null,
  },
  pro_india: {
    name: "Pro India",
    tailorsPerMonth: Infinity,
    templates: -1, // all
    watermark: false,
    priceIndia: 499,
    priceGlobal: null,
  },
  pro_global: {
    name: "Pro Global",
    tailorsPerMonth: Infinity,
    templates: -1,
    watermark: false,
    priceIndia: null,
    priceGlobal: 9,
  },
} as const;

export const TEMPLATES = ["clean", "modern", "minimal"] as const;
