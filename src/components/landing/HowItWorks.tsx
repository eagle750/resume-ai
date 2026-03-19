import { FileUp, FileText, Download } from "lucide-react";

const steps = [
  {
    icon: FileUp,
    title: "Upload your resume",
    description: "Upload your base resume once (PDF or DOCX). We extract the text and keep it ready.",
  },
  {
    icon: FileText,
    title: "Paste the job description",
    description: "Copy the full JD from the job posting. Our AI matches keywords and rewrites your bullets.",
  },
  {
    icon: Download,
    title: "Get tailored PDF",
    description: "See your ATS score, missing keywords, and suggestions. Download an ATS-friendly PDF.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-background border"
            >
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
