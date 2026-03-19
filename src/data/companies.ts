export interface CompanyData {
  slug: string;
  name: string;
  description: string;
  tips: string[];
  keywords: string[];
}

export const companies: CompanyData[] = [
  {
    slug: "google",
    name: "Google",
    description: "How to tailor your resume for Google India roles.",
    tips: [
      "Emphasize impact with metrics (e.g., 'Reduced latency by 40%').",
      "Include relevant CS fundamentals and system design experience.",
      "Use clear section headings and bullet points for ATS.",
    ],
    keywords: ["distributed systems", "algorithms", "data structures", "scale", "impact"],
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    description: "Resume tips for Microsoft India applications.",
    tips: [
      "Highlight cloud (Azure) and enterprise experience.",
      "Show collaboration and cross-team projects.",
      "Mention specific technologies from the JD.",
    ],
    keywords: ["Azure", "cloud", "enterprise", "collaboration", "C#", ".NET"],
  },
  {
    slug: "amazon",
    name: "Amazon",
    description: "Amazon India resume optimization guide.",
    tips: [
      "Follow Leadership Principles with STAR-style bullets.",
      "Focus on customer impact and ownership.",
      "Include scalability and operational excellence.",
    ],
    keywords: ["ownership", "customer obsession", "bias for action", "AWS", "scale"],
  },
  {
    slug: "tcs",
    name: "TCS",
    description: "TCS resume format and ATS tips.",
    tips: [
      "Keep format simple and ATS-friendly (no tables/graphics).",
      "List technologies and domains clearly.",
      "Include project duration and team size where relevant.",
    ],
    keywords: ["project delivery", "client", "technologies", "domain"],
  },
  {
    slug: "infosys",
    name: "Infosys",
    description: "Infosys resume format guide.",
    tips: [
      "Use a clean, single-column layout.",
      "Highlight certifications (e.g., Infosys certifications).",
      "Quantify experience and deliverables.",
    ],
    keywords: ["delivery", "certification", "client", "process"],
  },
  {
    slug: "wipro",
    name: "Wipro",
    description: "Wipro resume tips for applicants.",
    tips: [
      "Emphasize digital and domain skills.",
      "Mention agile/waterfall experience.",
      "Keep education and skills easy to scan.",
    ],
    keywords: ["digital", "agile", "domain", "client"],
  },
  {
    slug: "meta",
    name: "Meta",
    description: "Resume tips for Meta (Facebook) India.",
    tips: [
      "Focus on scale, mobile, and user growth metrics.",
      "Show product thinking and data-driven decisions.",
      "Use clear action verbs and outcomes.",
    ],
    keywords: ["scale", "mobile", "growth", "product", "data"],
  },
  {
    slug: "apple",
    name: "Apple",
    description: "Apple India resume guide.",
    tips: [
      "Highlight quality, design, and user experience.",
      "Show attention to detail and cross-functional work.",
      "Include relevant tools and platforms.",
    ],
    keywords: ["quality", "design", "UX", "detail", "cross-functional"],
  },
];
