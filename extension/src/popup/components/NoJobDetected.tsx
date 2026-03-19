import React from "react";

export default function NoJobDetected() {
  return (
    <div className="text-center py-6">
      <div className="text-3xl mb-3">🔍</div>
      <p className="text-sm text-gray-700 font-medium mb-1">No job listing detected</p>
      <p className="text-xs text-gray-500">
        Navigate to a job listing on LinkedIn, Indeed, or Naukri and click this extension again
      </p>
    </div>
  );
}
