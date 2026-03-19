import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { roles } from "@/data/roles";

interface Props {
  params: Promise<{ role: string }>;
}

export async function generateStaticParams() {
  return roles.map((r) => ({ role: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await params;
  const r = roles.find((x) => x.slug === role);
  if (!r) return {};
  return {
    title: `${r.title} Resume Example & Template [2026]`,
    description: `${r.description} Keywords, skills, and ATS tips for ${r.title} roles.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || ""}/resume-examples/${r.slug}`,
    },
  };
}

export default async function RoleExamplePage({ params }: Props) {
  const { role } = await params;
  const r = roles.find((x) => x.slug === role);
  if (!r) notFound();

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">
        {r.title} Resume Example & Guide [2026]
      </h1>
      <p className="text-muted-foreground mb-8">{r.description}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Skills to include</h2>
        <p className="text-muted-foreground">{r.skills.join(", ")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tips</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          {r.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8 p-4 rounded-lg bg-muted/50">
        <h2 className="font-semibold mb-2">Tailor your resume for {r.title} roles</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Paste a job description and get an ATS-optimized resume in 30 seconds.
        </p>
        <Link href="/dashboard" className="text-primary font-medium hover:underline">
          Try ResumeAI free →
        </Link>
      </section>

      <Link href="/resume-examples" className="text-sm text-muted-foreground hover:underline">
        ← All examples
      </Link>
    </div>
  );
}
