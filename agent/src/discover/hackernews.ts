export interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  time: number;
}

// HN has a free, no-auth API.
export async function getTopHNStories(limit = 20, minScore = 100): Promise<HNStory[]> {
  const res = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );
  const ids: number[] = await res.json();

  const stories = await Promise.all(
    ids.slice(0, limit).map(async (id) => {
      const r = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return r.json();
    })
  );

  return stories
    .filter((s: any) => s && s.score >= minScore && s.type === "story")
    .map((s: any) => ({
      id: s.id,
      title: s.title,
      url:
        s.url || `https://news.ycombinator.com/item?id=${s.id}`,
      score: s.score,
      time: s.time,
    }));
}

