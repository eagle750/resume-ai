import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTABanner() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to get more interviews?
        </h2>
        <p className="text-primary-foreground/90 mb-6 max-w-xl mx-auto">
          Join 10,000+ job seekers who tailor their resume in 30 seconds.
        </p>
        <Link href="/signup"><Button size="lg" variant="secondary">Try ResumeAI free</Button></Link>
      </div>
    </section>
  );
}
