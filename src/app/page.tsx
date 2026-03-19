import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQ } from "@/components/landing/FAQ";
import { CTABanner } from "@/components/landing/CTABanner";

export const metadata: Metadata = {
  title: "AI Resume Tailor — Match Your Resume to Any Job Description | Free",
  description:
    "Upload your resume, paste any job description, and get an ATS-optimized tailored resume in 30 seconds. Free for 3 resumes/month. Trusted by 10,000+ Indian job seekers.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://resumeai.in",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <BeforeAfter />
      <Testimonials />
      <PricingSection />
      <FAQ />
      <CTABanner />
    </>
  );
}
