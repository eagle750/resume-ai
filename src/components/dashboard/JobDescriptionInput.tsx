"use client";

import { Textarea } from "@/components/ui/textarea";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function JobDescriptionInput({
  value,
  onChange,
  placeholder = "Paste the full job description here…",
  minHeight = "200px",
}: JobDescriptionInputProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Job description</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="resize-y min-h-[200px]"
        style={{ minHeight }}
      />
      <p className="text-xs text-muted-foreground mt-1">
        {value.length} characters
      </p>
    </div>
  );
}
