import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { DndProvider } from "react-dnd";
import { AddCircle } from "@mui/icons-material";
import { HTML5Backend } from "react-dnd-html5-backend";
import TaskList from "./TaskList";
import { TaskContext } from "../context/TasksContext";
import DialogTask from "./DialogTask";

const Tasks = () => {
  const { tasks } = React.useContext(TaskContext);
  const [dialogTaskData, setDialogTaskData] = React.useState({
    openDialog: false,
    editableTaskId: "",
  });

  return (
    <React.Fragment>
      <Box
        sx={(theme) => ({
          bgcolor: theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
          overflowY: "scroll",
          height: "70vh",
          width: "150vh",
        })}
      >
        {tasks.length > 0 ? (
          <DndProvider backend={HTML5Backend}>
            <TaskList setDialogTaskData={setDialogTaskData} />
          </DndProvider>
        ) : (
          <Typography variant="body1" align="center" sx={{ mt: 3 }}>
            No tasks to display! Click the button below to add a new task.
          </Typography>
        )}
      </Box>
      <Box
        sx={{ display: "flex", flexDirection: "column", position: "relative" }}
      >
        <IconButton
          sx={{ position: "absolute", right: 2, bottom: 1 }}
          color="primary"
          size="large"
          onClick={() => {
            console.log("capo");
            setDialogTaskData({ openDialog: true, editableTaskId: "" });
          }}
        >
          <AddCircle fontSize="large" />
        </IconButton>
      </Box>
      <DialogTask
        dialogTaskData={dialogTaskData}
        setDialogTaskData={setDialogTaskData}
      />
    </React.Fragment>
  );
};

export default Tasks;
