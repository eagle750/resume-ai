import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ResumeAI terms of service.",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground">
        By using ResumeAI you agree to use the service for lawful purposes and to provide accurate information. This is a placeholder; replace with your full terms.
      </p>
    </div>
  );
}
