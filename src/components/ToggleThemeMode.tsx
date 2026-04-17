import React, { memo } from "react";
import { Sun, Moon } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Button } from "./ui/button";

interface ToggleThemeModeProps {
  mode: string;
  toggleThemeMode: () => void;
}

export const ToggleThemeMode = memo(({ mode, toggleThemeMode }: ToggleThemeModeProps) => {
  const isDark = mode === "dark";

  return (
    <div className="fixed bottom-4 left-4 z-[1000]">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleThemeMode}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            className="rounded-full h-10 w-10 bg-background shadow-md hover:shadow-lg border-border"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          Switch to {isDark ? "light" : "dark"} mode
        </TooltipContent>
      </Tooltip>
    </div>
  );
});

ToggleThemeMode.displayName = "ToggleThemeMode";
