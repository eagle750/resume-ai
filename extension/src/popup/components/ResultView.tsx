import React from "react";
import type { TailorResult } from "@/types";
import { ROUTES } from "@/utils/constants";

interface Props {
  result: TailorResult;
  onReset: () => void;
}

export default function ResultView({ result, onReset }: Props) {
  const score = result.ats_score;
  const scoreColor =
    score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-600";

  async function handleDownload() {
    try {
      const res = await fetch(ROUTES.generatePdf, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: result.id }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-tailored-${result.extracted_job_info.company_name || "job"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download. Try from the web dashboard.");
    }
  }

  return (
    <div>
      {/* ATS Score */}
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold ${scoreColor}`}>{score}</div>
        <p className="text-xs text-gray-500">ATS Match Score</p>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries(result.score_breakdown).map(([key, value]) => (
          <div key={key} className="bg-gray-50 rounded p-2 text-center">
            <div className="text-sm font-semibold">{value}%</div>
            <div className="text-[10px] text-gray-500 capitalize">
              {key.replace(/_/g, " ")}
            </div>
          </div>
        ))}
      </div>

      {/* Missing Keywords */}
      {result.missing_keywords.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Missing keywords to add:</p>
          <div className="flex flex-wrap gap-1">
            {result.missing_keywords.slice(0, 8).map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded-full"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleDownload}
          className="w-full py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600"
        >
          ⬇ Download Tailored PDF
        </button>
        <a
          href={`${ROUTES.dashboard}/history`}
          target="_blank"
          className="block w-full py-2.5 text-center border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
        >
          View full details on web →
        </a>
        <button
          onClick={onReset}
          className="w-full py-2 text-xs text-gray-400 hover:text-gray-600"
        >
          Tailor for another job
        </button>
      </div>
    </div>
  );
}
