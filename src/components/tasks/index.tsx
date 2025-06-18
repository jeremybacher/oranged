import React, { memo, useContext, useState, useCallback } from "react";
import { Box, Typography, Fab } from "@mui/material";
import { DndProvider } from "react-dnd";
import { Add } from "@mui/icons-material";
import { HTML5Backend } from "react-dnd-html5-backend";
import TaskList from "./TaskList";
import { TaskContext } from "../context/TasksContext";
import DialogTask from "./DialogTask";
import LoadingSpinner from "../LoadingSpinner";
import type { DialogTaskData } from "../types/DialogTaskData";

const Tasks = memo(() => {
  const { tasks, loading, error } = useContext(TaskContext);
  const [dialogTaskData, setDialogTaskData] = useState<DialogTaskData>({
    openDialog: false
  });

  const handleAddTask = useCallback(() => {
    setDialogTaskData({ openDialog: true });
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading tasks..." fullHeight />;
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '70vh',
          p: 3,
          color: 'error.main'
        }}
      >
        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
          Error loading tasks
        </Typography>
        <Typography variant="body2" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <React.Fragment>
      <Box
        sx={(theme) => ({
          bgcolor: theme.palette.background.paper,
          mb: 2,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          height: "70vh",
          maxWidth: "100%",
          position: "relative",
          borderRadius: 1,
        })}
      >
        {tasks.length > 0 ? (
          <DndProvider backend={HTML5Backend}>
            <TaskList setDialogTaskData={setDialogTaskData} />
          </DndProvider>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              p: 3 
            }}
          >
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 2 }}>
              No tasks yet
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Click the + button below to add your first task
            </Typography>
          </Box>
        )}
      </Box>
      
      <Fab
        color="primary"
        aria-label="Add new task"
        onClick={handleAddTask}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Add />
      </Fab>

      {dialogTaskData.openDialog && (
        <DialogTask
          dialogTaskData={dialogTaskData}
          setDialogTaskData={setDialogTaskData}
        />
      )}
    </React.Fragment>
  );
});

Tasks.displayName = 'Tasks';

export default Tasks;
