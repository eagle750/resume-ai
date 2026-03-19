import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { companies } from "@/data/companies";

interface Props {
  params: Promise<{ company: string }>;
}

export async function generateStaticParams() {
  return companies.map((c) => ({ company: `${c.slug}-resume` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company } = await params;
  const slug = company.replace(/-resume$/, "");
  const comp = companies.find((c) => c.slug === slug);
  if (!comp) return {};
  return {
    title: `${comp.name} Resume Tips — How to Tailor Your Resume for ${comp.name} [2026]`,
    description: `Get your resume past ${comp.name}'s ATS. AI-powered tips, keywords, and formatting guide for ${comp.name} job applications. Free resume tailor.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || ""}/tools/${comp.slug}-resume`,
    },
  };
}

export default async function CompanyResumePage({ params }: Props) {
  const { company } = await params;
  const slug = company.replace(/-resume$/, "");
  const comp = companies.find((c) => c.slug === slug);
  if (!comp) notFound();

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">
        How to Tailor Your Resume for {comp.name}
      </h1>
      <p className="text-muted-foreground mb-8">{comp.description}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">ATS tips for {comp.name}</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          {comp.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Keywords to include</h2>
        <p className="text-muted-foreground">
          {comp.keywords.join(", ")}
        </p>
      </section>

      <section className="mb-8 p-4 rounded-lg bg-muted/50">
        <h2 className="font-semibold mb-2">Tailor your resume for {comp.name} now</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Paste any {comp.name} job description and get an ATS-optimized resume in 30 seconds.
        </p>
        <Link href="/dashboard" className="text-primary font-medium hover:underline">
          Try ResumeAI free →
        </Link>
      </section>

      <Link href="/tools" className="text-sm text-muted-foreground hover:underline">
        ← All tools
      </Link>
    </div>
  );
}
