export type ContentType = "carousel" | "reel_script";

export const AGENT_CONFIG = {
  accountName: "TechBytes",
  handle: process.env.ACCOUNT_HANDLE ?? "@techbytes.daily",
  niche: process.env.ACCOUNT_NICHE ?? "tech tips, AI tools, dev life",
  targetAudience:
    "developers, tech enthusiasts, CS students in India",

  postingTimes: ["09:00", "13:00", "19:00"] as const,
  timezone: process.env.POSTING_TIMEZONE ?? "Asia/Kolkata",

  // Run separate cron triggers per slot to avoid long sleeps in CI.
  // Slot 0 -> 09:00 carousel #1
  // Slot 1 -> 13:00 carousel #2
  // Slot 2 -> 19:00 reel script (saved for later publishing)
  postingSlots: [
    { index: 0, time: "09:00", type: "carousel" as const },
    { index: 1, time: "13:00", type: "carousel" as const },
    { index: 2, time: "19:00", type: "reel_script" as const },
  ],

  dailyContentPlan: {
    carousels: 2,
    reelScripts: 1,
  },

  categories: [
    {
      name: "coding_tips",
      weight: 25,
      template: "5 [topic] tips every developer needs",
    },
    {
      name: "tool_review",
      weight: 20,
      template: "This AI tool does [X] in 10 seconds",
    },
    {
      name: "tech_news",
      weight: 20,
      template: "[News] explained in 30 seconds",
    },
    {
      name: "comparison",
      weight: 15,
      template: "Stop using [X], use [Y] instead",
    },
    {
      name: "career",
      weight: 10,
      template: "[Career tip] that nobody tells you",
    },
    {
      name: "meme_educational",
      weight: 10,
      template: "Junior vs Senior: [topic]",
    },
  ],

  carousel: {
    minSlides: 5,
    maxSlides: 10,
    imageWidth: 1080,
    imageHeight: 1080,
    colors: {
      primary: "#0F172A",
      secondary: "#1E293B",
      accent: "#F59E0B",
      text: "#F8FAFC",
      muted: "#94A3B8",
      code: "#10B981",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      code: "JetBrains Mono",
    },
  },

  hashtags: {
    core: [
      "#programming",
      "#coding",
      "#developer",
      "#tech",
      "#softwareengineering",
    ],
    niche: ["#webdev", "#javascript", "#python", "#ai", "#machinelearning"],
    growth: [
      "#learntocode",
      "#codingtips",
      "#devlife",
      "#techcommunity",
      "#100daysofcode",
    ],
    maxPerPost: 25,
  },

  sources: {
    reddit: ["programming", "webdev", "technology", "MachineLearning", "artificial"],
    hackerNewsMinScore: 100,
    // Keeping for future expansion; current implementation uses HN + Reddit.
    productHuntCategories: ["artificial-intelligence", "developer-tools"],
  },
};

