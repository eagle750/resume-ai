import React from "react";

interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorView({ message, onRetry }: Props) {
  return (
    <div className="text-center py-6">
      <div className="text-3xl mb-3">😵</div>
      <p className="text-sm text-gray-700 font-medium mb-1">Something went wrong</p>
      <p className="text-xs text-gray-500 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
      >
        Try again
      </button>
    </div>
  );
}
