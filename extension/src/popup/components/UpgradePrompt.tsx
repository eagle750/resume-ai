import React from "react";
import { ROUTES } from "@/utils/constants";

export default function UpgradePrompt() {
  return (
    <div className="text-center py-6">
      <div className="text-3xl mb-3">🚀</div>
      <p className="text-sm text-gray-700 font-medium mb-1">Free limit reached</p>
      <p className="text-xs text-gray-500 mb-4">
        You've used all 3 free tailors this month. Upgrade to Pro for unlimited tailoring.
      </p>
      <a
        href={ROUTES.pricing}
        target="_blank"
        className="inline-block px-6 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600"
      >
        Upgrade to Pro — ₹499/mo
      </a>
    </div>
  );
}
