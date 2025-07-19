import React, { useCallback, memo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import customTheme from "./components/themes/customTheme";
import { Container, CssBaseline, PaletteMode, Paper } from "@mui/material";
import { ToggleThemeMode } from "./components/ToggleThemeMode";
import General from "./components/General";
import { TaskProvider } from "./components/context/TasksContext";
import { SnackProvider } from "./components/context/SnackContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { useStorage } from "./components/hooks/useStorage";

const App = memo(() => {
  const { value: mode, setValue: setMode } = useStorage<PaletteMode>('themeMode', 'light');
  const theme = createTheme(customTheme(mode || 'light'));

  const toggleThemeMode = useCallback(async () => {
    const newMode = mode === "light" ? "dark" : "light";
    try {
      await setMode(newMode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }, [mode, setMode]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <SnackProvider>
          <TaskProvider>
            <CssBaseline />
            <Container
              maxWidth={false}
              component="main"
              sx={(theme) => ({
                bgcolor: theme.palette.mode === "light" ? "#cfe8fc" : "#02294f",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 1, sm: 2 },
              })}
            >
              <Paper
                elevation={3}
                sx={(theme) => ({
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "12px",
                  padding: { xs: "16px", sm: "20px" },
                  background:
                    theme.palette.mode === "light" ? "#fbfcfe" : "#131b20",
                  boxShadow: "rgba(0, 0, 0, 0.1) 0px 8px 32px",
                  width: "100%",
                  maxWidth: { xs: "100%", sm: "900px", md: "1200px" },
                  minHeight: { xs: "calc(100vh - 16px)", sm: "600px" },
                  maxHeight: { xs: "calc(100vh - 16px)", sm: "80vh" },
                })}
              >
                <General />
              </Paper>
              {mode && <ToggleThemeMode mode={mode} toggleThemeMode={toggleThemeMode} />}
            </Container>
          </TaskProvider>
        </SnackProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App;
