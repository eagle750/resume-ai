import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Resume & ATS Tips",
  description: "Resume and ATS optimization tips, company-specific guides, and career advice.",
};

const posts = [
  { slug: "how-to-tailor-resume-for-ats", title: "How to Tailor Your Resume for ATS in 2026" },
  { slug: "resume-keywords-that-get-interviews", title: "50 Resume Keywords That Get You Interviews" },
  { slug: "best-resume-format-india-2026", title: "Best Resume Format for India in 2026" },
  { slug: "google-resume-tips", title: "Google India Resume Tips" },
  { slug: "tcs-infosys-resume-format", title: "TCS, Infosys, Wipro Resume Format" },
  { slug: "software-engineer-resume-guide", title: "Software Engineer Resume Guide" },
  { slug: "data-analyst-resume-tips", title: "Data Analyst Resume Tips" },
  { slug: "ats-friendly-resume-template", title: "ATS-Friendly Resume Template" },
  { slug: "how-many-keywords-in-resume", title: "How Many Keywords Should a Resume Have?" },
  { slug: "resume-vs-cv-difference-india", title: "Resume vs CV — Difference in India" },
];

export default function BlogPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="text-primary hover:underline">
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
