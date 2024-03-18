import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import customTheme from "./components/themes/customTheme";
import { Container, CssBaseline, PaletteMode, Paper } from "@mui/material";
import { ToggleThemeMode } from "./components/ToggleThemeMode";
import General from "./components/General";
import { TaskProvider } from "./components/context/TasksContext";
import { SnackProvider } from "./components/context/SnackContext";

const App = () => {
  const [mode, setMode] = useState<PaletteMode>("light");
  const theme = createTheme(customTheme(mode));

  useEffect(() => {
    chrome.storage.sync.get(["themeMode"], function (result) {
      setMode(result.themeMode || "light");
    });
  }, []);

  const toggleThemeMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    chrome.storage.sync.set({ themeMode: newMode });
  };

  return (
    <ThemeProvider theme={theme}>
      <SnackProvider>
        <TaskProvider>
          <CssBaseline />
          <Container
            maxWidth={false}
            component={"main"}
            sx={(theme) => ({
              bgcolor: theme.palette.mode === "light" ? "#cfe8fc" : "#02294f",
              justifyContent: "center",
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 2,
            })}
          >
            <Paper
              sx={(theme) => ({
                display: "flex",
                flexDirection: "column",
                borderRadius: "10px",
                padding: "20px",
                background:
                  theme.palette.mode === "light" ? "#fbfcfe" : "#131b20",
                boxShadow: "rgba(0, 0, 0, 0.77) 1px 7px 30px -10px",
              })}
            >
              <General />
            </Paper>
            <ToggleThemeMode mode={mode} toggleThemeMode={toggleThemeMode} />
          </Container>
        </TaskProvider>
      </SnackProvider>
    </ThemeProvider>
  );
};

export default App;
