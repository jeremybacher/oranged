import React, { memo } from "react";
import { PaletteMode, Box, IconButton, Tooltip } from "@mui/material";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import ModeNightRoundedIcon from "@mui/icons-material/ModeNightRounded";

interface ToggleThemeModeProps {
  mode: PaletteMode;
  toggleThemeMode: () => void;
}

export const ToggleThemeMode = memo(({
  mode,
  toggleThemeMode,
}: ToggleThemeModeProps) => {
  const isDark = mode === "dark";
  
  return (
    <Box sx={{ position: "fixed", bottom: 16, left: 16, zIndex: 1000 }}>
      <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
        <IconButton
          onClick={toggleThemeMode}
          size="large"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
              boxShadow: 4,
            },
          }}
        >
          {isDark ? (
            <WbSunnyRoundedIcon />
          ) : (
            <ModeNightRoundedIcon />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
});

ToggleThemeMode.displayName = 'ToggleThemeMode';
