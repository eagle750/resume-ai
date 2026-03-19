"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { TailoredResume } from "@/types";

interface DownloadPDFProps {
  resume: TailoredResume;
  addWatermark: boolean;
}

export function DownloadPDF({ resume, addWatermark }: DownloadPDFProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          template: "clean",
          addWatermark,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tailored-resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <Button onClick={handleDownload} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Generating…" : "Download PDF"}
    </Button>
  );
}
