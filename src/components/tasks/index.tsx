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
    openDialog: false
  });

  return (
    <React.Fragment>
      <Box
        sx={(theme) => ({
          bgcolor: theme.palette.background.paper,
          mb: 2,
          display: "flex",
          flexDirection: "column",
          overflowY: "scroll",
          height: "70vh",
          width: "150vh",
          position: "relative"
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
      <div style={{position: "relative", cursor: "pointer" }}>
        <AddCircle color="primary" fontSize="large" onClick={() => {
          setDialogTaskData({ openDialog: true });
        }} sx={{ position: "absolute", right: 6, bottom: 6, padding: 0, zIndex: 1 }} />
        <div style={{
            backgroundColor: "white",
            position: "absolute",
            right: 16,
            bottom: 15,
            width: "15px",
            height: "15px",
        }}></div>
      </div>
      {dialogTaskData.openDialog && <DialogTask
        dialogTaskData={dialogTaskData}
        setDialogTaskData={setDialogTaskData}
      /> }
    </React.Fragment>
  );
};

export default Tasks;
