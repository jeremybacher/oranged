import React from "react";
import { cn } from "../lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullHeight?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  fullHeight = false,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-6",
        fullHeight && "h-[70vh]"
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
