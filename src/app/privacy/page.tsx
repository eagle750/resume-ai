import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ResumeAI privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground">
        We use your resume text only to generate tailored content and do not use it for model training. Authentication is handled by NextAuth.js with Google OAuth. Data is stored in Neon Postgres, and files are stored in Cloudflare R2. See our provider policies for details. This is a placeholder; replace with your full privacy policy.
      </p>
    </div>
  );
}
