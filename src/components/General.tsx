import React, { useEffect } from "react";
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

const General = () => {
  const [tab, setTab] = React.useState<number>(0);
  const { tasks } = React.useContext(TaskContext);
  const { message, setMessage } = React.useContext(SnackContext);

  useEffect(() => {
    chrome.storage.sync.get(["activeTab"], function (result) {
      setTab(result.activeTab || 0);
    });
  }, []);

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
      component={"section"}
      sx={{ display: "flex", flexDirection: "column", flex: 1 }}
    >
      <Stack id="general">
        <Tabs
          value={tab}
          onChange={(_: React.SyntheticEvent, newTab: number) => {
            chrome.storage.sync.set({ activeTab: newTab });
            setTab(newTab);
          }}
          textColor="inherit"
          indicatorColor="primary"
          variant="fullWidth"
        >
          {tabs.map((tab: Tab) => (
            <MuiTab
              key={tab.id}
              value={tab.id}
              label={
                tab.length && tab.length > 0
                  ? `${tab.label} (${tab.length})`
                  : tab.label
              }
              sx={{ width: `${100 / tabs.length}%` }}
            />
          ))}
        </Tabs>
      </Stack>
      {tabs.map((current) => (
        <Box
          key={current.id}
          component={"div"}
          sx={{
            display: tab === current.id ? "block" : "none",
            mt: 2,
            flex: 1,
          }}
        >
          {current.tabs}
        </Box>
      ))}
      <Snackbar
        open={message !== ""}
        autoHideDuration={5000}
        onClose={() => setMessage("")}
      >
        <Alert
          onClose={() => setMessage("")}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default General;
