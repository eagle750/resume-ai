"use client";

import type { TailoredResume } from "@/types";

interface TailoredPreviewProps {
  resume: TailoredResume;
}

export function TailoredPreview({ resume }: TailoredPreviewProps) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Summary
        </h3>
        <p className="text-sm">{resume.summary}</p>
      </section>
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Experience
        </h3>
        {resume.experience?.map((exp, i) => (
          <div key={i} className="mb-4">
            <p className="font-medium">{exp.title} · {exp.company}</p>
            <p className="text-xs text-muted-foreground mb-1">{exp.duration}</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {exp.bullets?.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Skills
        </h3>
        <p className="text-sm">{resume.skills?.join(" · ")}</p>
      </section>
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Education
        </h3>
        {resume.education?.map((ed, i) => (
          <p key={i} className="text-sm">
            {ed.degree}, {ed.institution} ({ed.year})
          </p>
        ))}
      </section>
    </div>
  );
}
