import { getTopHNStories } from "./hackernews";
import { getRedditTrending } from "./reddit";
import { AGENT_CONFIG } from "../config";

export interface TrendingTopic {
  title: string;
  source: string;
  url: string;
  score: number;
  summary: string;
}

function dedupeTopics(topics: TrendingTopic[]): TrendingTopic[] {
  const seen = new Set<string>();
  const out: TrendingTopic[] = [];
  for (const t of topics) {
    const key = t.title.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export async function discoverTrendingTopics(): Promise<TrendingTopic[]> {
  const [hnStories, redditPosts] = await Promise.all([
    getTopHNStories(20, AGENT_CONFIG.sources.hackerNewsMinScore),
    getRedditTrending(AGENT_CONFIG.sources.reddit, 10),
  ]);

  const topics: TrendingTopic[] = [
    ...hnStories.map((s) => ({
      title: s.title,
      source: "hackernews",
      url: s.url,
      score: s.score,
      summary: s.title,
    })),
    ...redditPosts.map((p) => ({
      title: p.title,
      source: `reddit/r/${p.subreddit}`,
      url: p.url,
      score: p.score + p.num_comments,
      summary: p.selftext || p.title,
    })),
  ];

  return dedupeTopics(
    topics
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
  );
}

