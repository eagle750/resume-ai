import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Resume Tools",
  description: "ATS score checker, keyword scanner, and summary generator. Free tools to optimize your resume.",
};

const tools = [
  { href: "/tools/ats-score-checker", name: "ATS Score Checker", description: "Paste your resume and a job description to see your ATS match score (no signup)." },
  { href: "/tools/resume-keyword-scanner", name: "Resume Keyword Scanner", description: "Extract important keywords from any job description." },
  { href: "/tools/resume-summary-generator", name: "Resume Summary Generator", description: "Generate a professional summary from your experience." },
];

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Free resume tools</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Use these tools without signing up. Create an account to get the full tailored resume and PDF.
      </p>
      <ul className="space-y-6">
        {tools.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="block p-4 rounded-lg border hover:bg-muted/50">
              <h2 className="font-semibold">{t.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
