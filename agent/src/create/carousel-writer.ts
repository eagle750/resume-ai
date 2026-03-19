import Anthropic from "@anthropic-ai/sdk";
import { BRAND_VOICE_PROMPT } from "./brand-voice";
import { AGENT_CONFIG } from "../config";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface CarouselSlide {
  slideNumber: number;
  type: "hook" | "content" | "code" | "comparison" | "cta";
  heading: string;
  body: string;
  codeSnippet?: string;
  emoji?: string;
}

export interface CarouselContent {
  slides: CarouselSlide[];
  caption: string;
  firstComment: string;
}

export async function writeCarousel(
  topic: string,
  hook: string,
  angle: string,
  category: string,
  hashtags: string[]
): Promise<CarouselContent> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `${BRAND_VOICE_PROMPT}

TASK: Write a complete Instagram carousel post about: "${topic}"
Hook/First slide: "${hook}"
Angle: "${angle}"
Category: ${category}

SLIDE RULES:
- Slide 1: HOOK (bold claim, question, or surprising stat). MAX 15 words.
- Slides 2-8: CONTENT slides. MAX 40 words per slide.
- If relevant, include 1 CODE slide with a real, useful code snippet (3-5 lines).
- Last slide is ALWAYS a CTA with:
  "Follow ${AGENT_CONFIG.handle} for daily tech tips"
  "Save this for later"
  "Share with a dev friend"
- Total slides must be between ${AGENT_CONFIG.carousel.minSlides}-${AGENT_CONFIG.carousel.maxSlides}.

CAPTION RULES:
- First line repeats the hook (what shows in feed preview).
- 2-3 short paragraphs.
- End with a question to drive comments.
- NO hashtags in caption. Put hashtags only in the first comment.

Respond with ONLY valid JSON:
{
  "slides": [
    {
      "slideNumber": 1,
      "type": "hook",
      "heading": "Bold hook text",
      "body": "",
      "emoji": ":spark:"
    }
  ],
  "caption": "Caption text here...\\n\\nWhich tip was your favorite?",
  "firstComment": "#tag1 #tag2"
}`,
      },
    ],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as CarouselContent;
}

