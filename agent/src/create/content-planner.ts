import Anthropic from "@anthropic-ai/sdk";
import { BRAND_VOICE_PROMPT } from "./brand-voice";
import { AGENT_CONFIG, type ContentType } from "../config";
import type { TrendingTopic } from "../discover/aggregator";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type TargetEmotion = "curiosity" | "surprise" | "fomo" | "motivation";

export interface BasePlan {
  topic: string;
  category: string;
  angle: string;
  hook: string;
  targetEmotion: TargetEmotion;
  hashtags: string[];
}

export interface CarouselPlan extends BasePlan {
  type: "carousel";
}

export interface ReelPlan extends BasePlan {
  type: "reel_script";
}

export type SlotPlan = CarouselPlan | ReelPlan;

function extractJson(text: string): string {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) return text.trim();
  return text.slice(firstBrace, lastBrace + 1);
}

function hashtagsFromConfig(raw: string[]): string[] {
  const max = AGENT_CONFIG.hashtags.maxPerPost;
  return raw.slice(0, max);
}

export async function planPostForSlot(
  trendingTopics: TrendingTopic[],
  recentlyPostedTopics: string[],
  slotType: ContentType
): Promise<SlotPlan> {
  const topicsList = trendingTopics
    .slice(0, 15)
    .map(
      (t, i) =>
        `${i + 1}. [${t.source}] ${t.title} (score: ${t.score})`
    )
    .join("\n");

  const recentList = recentlyPostedTopics.join(", ");

  const categoriesText = AGENT_CONFIG.categories
    .map((c) => `- ${c.name}: "${c.template}"`)
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1600,
    messages: [
      {
        role: "user",
        content: `${BRAND_VOICE_PROMPT}

TASK: Plan ONE Instagram post for slotType="${slotType}".

SLOT GOAL:
${slotType === "carousel" ? "Create a carousel you can explain visually." : "Create a short 60-second reel script you can perform or later animate."}

TRENDING TOPICS TODAY:
${topicsList}

RECENTLY POSTED (avoid these):
${recentList || "None yet"}

CONTENT CATEGORIES TO ROTATE:
${categoriesText}

Pick the plan that is:
1. Trending RIGHT NOW (timely)
2. NOT recently posted by us
3. Likely to get saves/shares (educational + actionable)
4. Easy to write with the brand voice

Respond with ONLY valid JSON:
{
  "type": "${slotType}",
  "topic": "specific topic title",
  "category": "one of the category names",
  "hook": "Slide 1 (carousel) or Reel intro line that stops the scroll (<= 15 words)",
  "angle": "unique angle (how we will frame it)",
  "targetEmotion": "${["curiosity", "surprise", "fomo", "motivation"].join(" | ")}",
  "hashtags": ["#tag1", "#tag2", "... up to ${AGENT_CONFIG.hashtags.maxPerPost} total"]
}`,
      },
    ],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  const cleaned = extractJson(text).replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleaned) as Omit<SlotPlan, "hashtags"> & { hashtags: string[] };

  parsed.hashtags = hashtagsFromConfig(parsed.hashtags ?? []);
  return parsed as SlotPlan;
}

