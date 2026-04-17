import React, { memo, useContext, useState, useCallback } from "react";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, Typography } from "@mui/material";
import { DndProvider } from "react-dnd";
import { Add, DeleteSweep } from "@mui/icons-material";
import { HTML5Backend } from "react-dnd-html5-backend";
import TaskList from "./TaskList";
import { TaskContext } from "../context/TasksContext";
import DialogTask from "./DialogTask";
import LoadingSpinner from "../LoadingSpinner";
import type { DialogTaskData } from "../types/DialogTaskData";

const Tasks = memo(() => {
  const { tasks, setTasks, loading, error } = useContext(TaskContext);
  const [dialogTaskData, setDialogTaskData] = useState<DialogTaskData>({
    openDialog: false
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleAddTask = useCallback(() => {
    setDialogTaskData({ openDialog: true });
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const allSelected = tasks.length > 0 && selectedIds.size === tasks.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < tasks.length;

  const handleToggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map((t) => t.id)));
    }
  }, [allSelected, tasks]);

  const handleDeleteSelected = useCallback(async () => {
    const updated = tasks.filter((t) => !selectedIds.has(t.id));
    await setTasks(updated);
    setSelectedIds(new Set());
    setConfirmDeleteOpen(false);
  }, [tasks, selectedIds, setTasks]);

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
        {selectedIds.size > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 0.5, borderBottom: 1, borderColor: "divider", minHeight: 44 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleToggleSelectAll}
                aria-label={allSelected ? "Deselect all tasks" : "Select all tasks"}
              />
              <Typography variant="body2" color="text.secondary">
                {selectedIds.size} selected
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" onClick={() => setSelectedIds(new Set())}>
                Cancel
              </Button>
              <Button size="small" variant="contained" color="error" startIcon={<DeleteSweep aria-hidden="true" />} onClick={() => setConfirmDeleteOpen(true)}>
                Delete
              </Button>
            </Box>
          </Box>
        )}
        {tasks.length > 0 ? (
          <DndProvider backend={HTML5Backend}>
            <TaskList setDialogTaskData={setDialogTaskData} selectedIds={selectedIds} onToggleSelect={handleToggleSelect} />
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
        <Add aria-hidden="true" />
      </Fab>

      {dialogTaskData.openDialog && (
        <DialogTask
          dialogTaskData={dialogTaskData}
          setDialogTaskData={setDialogTaskData}
        />
      )}

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {selectedIds.size} {selectedIds.size === 1 ? "task" : "tasks"}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete {selectedIds.size === 1 ? "the selected task" : `all ${selectedIds.size} selected tasks`}. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" startIcon={<DeleteSweep aria-hidden="true" />} onClick={handleDeleteSelected}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
});

Tasks.displayName = 'Tasks';

export default Tasks;
