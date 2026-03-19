import React, { useState, useEffect } from "react";

const messages = [
  "Analyzing job description...",
  "Matching your experience...",
  "Optimizing keywords for ATS...",
  "Rewriting bullet points...",
  "Calculating match score...",
];

export default function TailoringLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-8">
      <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-sm text-gray-700 font-medium">{messages[msgIndex]}</p>
      <p className="text-xs text-gray-400 mt-1">Usually takes 15-30 seconds</p>
    </div>
  );
}
