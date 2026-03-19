import type { Metadata } from "next";
import { PricingSection } from "@/components/landing/PricingSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing — ResumeAI",
  description: "Free plan: 3 tailors/month. Pro India: ₹499/month. Pro Global: $9/month. Unlimited tailoring, no watermark.",
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="text-muted-foreground mt-2">
          Start free. Upgrade when you need more.
        </p>
      </div>
      <PricingSection />
      <div className="text-center mt-8">
        <Link href="/"><Button variant="outline">Back to home</Button></Link>
      </div>
    </div>
  );
}
