import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resume Summary Generator",
  description: "Free tool to generate a professional resume summary. Use ResumeAI for full tailoring.",
};

export default function SummaryGeneratorPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Resume summary generator</h1>
      <p className="text-muted-foreground mb-8">
        For a summary tailored to each job, use our main product: upload your resume and paste the job description to get an AI-written summary plus full tailored resume and ATS score.
      </p>
      <Link href="/dashboard" className="text-primary font-medium hover:underline">
        Go to ResumeAI dashboard →
      </Link>
    </div>
  );
}
