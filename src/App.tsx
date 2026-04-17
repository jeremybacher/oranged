import React, { useCallback, memo, useEffect } from "react";
import { ToggleThemeMode } from "./components/ToggleThemeMode";
import General from "./components/General";
import { TaskProvider } from "./components/context/TasksContext";
import { SnackProvider } from "./components/context/SnackContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { useStorage } from "./components/hooks/useStorage";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";

type ThemeMode = "light" | "dark";

const App = memo(() => {
  const { value: mode, setValue: setMode } = useStorage<ThemeMode>("themeMode", "light");

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [mode]);

  const toggleThemeMode = useCallback(async () => {
    const newMode = mode === "light" ? "dark" : "light";
    try {
      await setMode(newMode);
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  }, [mode, setMode]);

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <SnackProvider>
          <TaskProvider>
            <div className="min-h-screen flex flex-col items-center justify-center p-1 sm:p-2 bg-[#cfe8fc] dark:bg-[#02294f]">
              <div className="flex flex-col rounded-[12px] p-4 sm:p-5 bg-[#fbfcfe] dark:bg-[#131b20] shadow-[rgba(0,0,0,0.1)_0px_8px_32px] w-full max-w-full sm:max-w-[900px] md:max-w-[1200px] min-h-[calc(100vh-8px)] sm:min-h-[600px] sm:max-h-[80vh]">
                <General />
              </div>
              {mode && (
                <ToggleThemeMode mode={mode} toggleThemeMode={toggleThemeMode} />
              )}
            </div>
            <Toaster position="bottom-center" richColors />
          </TaskProvider>
        </SnackProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
});

App.displayName = "App";

export default App;
