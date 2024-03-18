import React from "react";
import { PaletteMode } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import ModeNightRoundedIcon from "@mui/icons-material/ModeNightRounded";

interface ToggleThemeModeProps {
  mode: PaletteMode;
  toggleThemeMode: () => void;
}

export function ToggleThemeMode({
  mode,
  toggleThemeMode,
}: ToggleThemeModeProps) {
  return (
    <Box sx={{ position: "fixed", bottom: 16, left: 16 }} >
      <Button
        variant="text"
        onClick={toggleThemeMode}
        size="small"
        sx={{ minWidth: "40px", height: "40px" }}
      >
        {mode === "dark" ? (
          <WbSunnyRoundedIcon fontSize="small" />
        ) : (
          <ModeNightRoundedIcon fontSize="small" />
        )}
      </Button>
    </Box>
  );
}
