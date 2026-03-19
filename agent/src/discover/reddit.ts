export interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  score: number;
  subreddit: string;
  num_comments: number;
}

export async function getRedditTrending(
  subreddits: string[],
  limit = 10
): Promise<RedditPost[]> {
  const allPosts: RedditPost[] = [];

  for (const sub of subreddits) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${encodeURIComponent(sub)}/hot.json?limit=${limit}`,
        {
          headers: { "User-Agent": "TechBytesAgent/1.0" },
        }
      );
      if (!res.ok) continue;
      const data = await res.json();

      const posts = (data?.data?.children ?? [])
        .map((child: any) => child.data)
        .filter((p: any) => p && p.score > 50 && !p.stickied)
        .map((p: any) => ({
          title: p.title,
          selftext: p.selftext?.slice(0, 500) || "",
          url: p.url,
          score: p.score,
          subreddit: sub,
          num_comments: p.num_comments,
        }));

      allPosts.push(...posts);
    } catch {
      // Ignore failing subreddit feeds.
    }
  }

  return allPosts.sort(
    (a, b) => b.score + b.num_comments - (a.score + a.num_comments)
  );
}

