import React, { useContext, useCallback, memo } from "react";
import {
  Box,
  Stack,
  Tab as MuiTab,
  Tabs,
  Snackbar,
  Alert,
} from "@mui/material";
import Notes from "./Notes";
import Tasks from "./tasks";
import { TaskContext } from "./context/TasksContext";
import { SnackContext } from "./context/SnackContext";
import { useStorage } from "./hooks/useStorage";
import type { Tab } from "./types/Tab";

const General = memo(() => {
  const { value: tab, setValue: setTabStorage } = useStorage<number>('activeTab', 0);
  const { tasks } = useContext(TaskContext);
  const { message, setMessage } = useContext(SnackContext);

  const handleTabChange = useCallback(async (_: React.SyntheticEvent, newTab: number) => {
    try {
      await setTabStorage(newTab);
    } catch (error) {
      console.error('Failed to save active tab:', error);
    }
  }, [setTabStorage]);

  const handleCloseSnackbar = useCallback(() => {
    setMessage("");
  }, [setMessage]);

  const tabs: Tab[] = [
    {
      id: 0,
      label: "Tasks",
      tabs: <Tasks />,
      length: tasks.filter((task) => !task.completed).length,
    },
    {
      id: 1,
      label: "Notes",
      tabs: <Notes />,
    },
  ];

  return (
    <Box
      component="section"
      sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      <Stack id="general">
        <Tabs
          value={tab || 0}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="primary"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 2,
          }}
        >
          {tabs.map((currentTab: Tab) => (
            <MuiTab
              key={currentTab.id}
              value={currentTab.id}
              label={
                currentTab.length && currentTab.length > 0
                  ? `${currentTab.label} (${currentTab.length})`
                  : currentTab.label
              }
              sx={{ 
                width: `${100 / tabs.length}%`,
                minHeight: 48,
              }}
            />
          ))}
        </Tabs>
      </Stack>
      
      {tabs.map((current) => (
        <Box
          key={current.id}
          component="div"
          sx={{
            display: (tab || 0) === current.id ? "flex" : "none",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}
        >
          {current.tabs}
        </Box>
      ))}
      
      <Snackbar
        open={message !== ""}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

General.displayName = 'General';

export default General;
