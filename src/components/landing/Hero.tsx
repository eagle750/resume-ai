import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto relative">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto text-center">
          Paste a job description → Get an ATS-optimized resume in 30 seconds
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-center">
          Upload your resume once. Paste any JD. AI rewrites your resume to match—keywords, bullets, and score. Download a clean PDF.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup"><Button size="lg">Start free — 3 tailors/month</Button></Link>
          <Link href="/tools/ats-score-checker"><Button size="lg" variant="outline">Check ATS score free</Button></Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground text-center">
          No credit card. Trusted by 10,000+ job seekers.
        </p>
      </div>
    </section>
  );
}
