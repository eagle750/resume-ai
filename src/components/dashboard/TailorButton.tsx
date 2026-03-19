"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TailorButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  label?: string;
}

export function TailorButton({
  onClick,
  loading,
  disabled = false,
  label = "Tailor my resume",
}: TailorButtonProps) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      disabled={disabled || loading}
      className="min-w-[180px]"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Tailoring…
        </>
      ) : (
        label
      )}
    </Button>
  );
}
