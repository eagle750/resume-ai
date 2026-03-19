import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function initTopicHistory(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS instagram_posts (
      id SERIAL PRIMARY KEY,
      topic TEXT NOT NULL,
      category TEXT,
      instagram_id TEXT,
      posted_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function getRecentTopics(limit = 30): Promise<string[]> {
  const rows = await sql`
    SELECT topic FROM instagram_posts
    ORDER BY posted_at DESC
    LIMIT ${limit}
  `;

  return rows.map((r: any) => r.topic as string);
}

export async function savePostedTopic(
  topic: string,
  category: string,
  instagramId: string
): Promise<void> {
  await sql`
    INSERT INTO instagram_posts (topic, category, instagram_id)
    VALUES (${topic}, ${category}, ${instagramId})
  `;
}

