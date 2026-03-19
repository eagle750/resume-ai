"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeUploaderProps {
  onTextExtracted: (text: string, filename: string) => void;
  currentText?: string | null;
  currentFilename?: string | null;
}

export function ResumeUploader({
  onTextExtracted,
  currentText,
  currentFilename,
}: ResumeUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      setError("");
      setLoading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/parse-resume", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to parse file");
          setLoading(false);
          return;
        }
        onTextExtracted(data.text, data.filename);
      } catch {
        setError("Upload failed");
      }
      setLoading(false);
    },
    [onTextExtracted]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".docx") || f.name.endsWith(".doc"))) {
        handleFile(f);
      } else {
        setError("Only PDF and DOCX are supported");
      }
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      e.target.value = "";
    },
    [handleFile]
  );

  if (currentText && currentText.length > 50) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {currentFilename || "Resume loaded"}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onTextExtracted("", "")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {currentText.length} characters. Replace by uploading again.
        </p>
      </div>
    );
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      className="rounded-lg border-2 border-dashed p-8 text-center"
    >
      <input
        type="file"
        accept=".pdf,.docx,.doc"
        onChange={onInputChange}
        className="hidden"
        id="resume-upload"
      />
      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        Drag & drop your resume (PDF or DOCX) or click to upload
      </p>
      <label htmlFor="resume-upload">
        <Button type="button" variant="outline" disabled={loading}>
          {loading ? "Parsing…" : "Choose file"}
        </Button>
      </label>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
