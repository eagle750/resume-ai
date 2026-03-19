import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
}

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.(mdx|md)$/, ""));
}

export function getBlogBySlug(slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const altPath = path.join(CONTENT_DIR, `${slug}.md`);
  const p = fs.existsSync(filePath) ? filePath : fs.existsSync(altPath) ? altPath : null;
  if (!p) return null;
  const raw = fs.readFileSync(p, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: (data.title as string) || slug,
    description: (data.description as string) || "",
    date: (data.date as string) || "",
    content,
  };
}
