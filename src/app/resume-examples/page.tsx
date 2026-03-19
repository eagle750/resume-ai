import type { Metadata } from "next";
import Link from "next/link";
import { roles } from "@/data/roles";

export const metadata: Metadata = {
  title: "Resume Examples by Role",
  description: "ATS-optimized resume examples and guides for software engineer, data analyst, product manager, and more.",
};

export default function ResumeExamplesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Resume examples</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Role-specific examples and tips. Use ResumeAI to tailor your resume to any job.
      </p>
      <ul className="grid sm:grid-cols-2 gap-4">
        {roles.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/resume-examples/${r.slug}`}
              className="block p-4 rounded-lg border hover:bg-muted/50"
            >
              <h2 className="font-semibold">{r.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
