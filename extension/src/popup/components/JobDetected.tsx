import React from "react";
import type { JobData } from "@/types";

interface Props {
  job: JobData;
  onTailor: () => void;
}

export default function JobDetected({ job, onTailor }: Props) {
  return (
    <div>
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          Detected from {job.site}
        </p>
        <p className="text-sm font-semibold text-gray-900 leading-tight">
          {job.title}
        </p>
        <p className="text-xs text-gray-600 mt-0.5">{job.company}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
        <p className="text-xs text-gray-500 mb-1">Job Description Preview:</p>
        <p className="text-xs text-gray-700 leading-relaxed">
          {job.description.slice(0, 500)}
          {job.description.length > 500 ? "..." : ""}
        </p>
      </div>

      <button
        onClick={onTailor}
        className="w-full py-3 bg-amber-500 text-white font-semibold text-sm rounded-lg hover:bg-amber-600 active:bg-amber-700 transition-colors"
      >
        ✨ Tailor My Resume
      </button>
    </div>
  );
}
