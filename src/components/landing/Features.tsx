import { Zap, Shield, Palette, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "30-second tailoring",
    description: "Claude AI rewrites your resume to match the JD—keywords, bullets, and structure.",
  },
  {
    icon: BarChart3,
    title: "ATS score & breakdown",
    description: "See your match score (0–100) and get missing keywords and improvement suggestions.",
  },
  {
    icon: Palette,
    title: "Clean PDF export",
    description: "Download an ATS-friendly PDF. Pro users get multiple templates and no watermark.",
  },
  {
    icon: Shield,
    title: "Your data stays yours",
    description: "Resume text is processed securely and not used for model training.",
  },
];

export function Features() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Why ResumeAI</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-lg border bg-card"
            >
              <f.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
