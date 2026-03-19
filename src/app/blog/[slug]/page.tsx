import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BlogPostJsonLd } from "@/components/seo/JsonLd";
import { getBlogSlugs, getBlogBySlug } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL || ""}/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container max-w-3xl py-12">
      <BlogPostJsonLd
        title={post.title}
        description={post.description}
        date={post.date}
        slug={slug}
      />
      <Link href="/blog" className="text-sm text-muted-foreground hover:underline mb-6 inline-block">
        ← Blog
      </Link>
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-muted-foreground text-sm mb-8">{post.date}</p>
      <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">
        {post.content}
      </div>
      <div className="mt-12 p-4 rounded-lg bg-muted/50">
        <p className="font-medium mb-2">Try ResumeAI free</p>
        <p className="text-sm text-muted-foreground mb-4">
          Tailor your resume to any job description in 30 seconds.
        </p>
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Get started →
        </Link>
      </div>
    </article>
  );
}
