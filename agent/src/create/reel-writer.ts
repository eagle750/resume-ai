import Anthropic from "@anthropic-ai/sdk";
import { BRAND_VOICE_PROMPT } from "./brand-voice";
import { AGENT_CONFIG } from "../config";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ReelContent {
  script: string; // 60-second script
  caption: string;
  firstComment: string;
}

export async function writeReelScript(
  topic: string,
  hook: string,
  angle: string,
  category: string,
  hashtags: string[]
): Promise<ReelContent> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2200,
    messages: [
      {
        role: "user",
        content: `${BRAND_VOICE_PROMPT}

TASK: Write a short 60-second reel script for a faceless tech account.
Topic: "${topic}"
Intro/Hook: "${hook}"
Angle: "${angle}"
Category: ${category}

SCRIPT RULES:
- Write it as voiceover + on-screen text lines
- Total length should fit ~60 seconds when spoken naturally
- Include 3-5 beats with clear transitions
- End with a CTA to follow the account

CAPTION RULES:
- Caption should be 2-3 short paragraphs
- End with a question for comments
- NO hashtags in caption; hashtags go into first comment

First slide/hook should strongly stop the scroll.

Respond with ONLY valid JSON:
{
  "script": "0-10s: ...\\n10-25s: ...\\n...\\n50-60s: ...",
  "caption": "Caption text without hashtags ...\\n\\nQuestion?",
  "firstComment": "${hashtags.join(" ")}"
}`,
      },
    ],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as ReelContent;
}

