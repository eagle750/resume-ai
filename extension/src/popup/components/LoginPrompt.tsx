import React from "react";
import { ROUTES } from "@/utils/constants";

export default function LoginPrompt() {
  return (
    <div className="text-center py-6">
      <div className="text-3xl mb-3">🔐</div>
      <p className="text-sm text-gray-700 font-medium mb-1">Not logged in</p>
      <p className="text-xs text-gray-500 mb-4">
        Log into ResumeAI in your browser to use the extension
      </p>
      <a
        href={ROUTES.login}
        target="_blank"
        className="inline-block px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
      >
        Log in to ResumeAI
      </a>
    </div>
  );
}
