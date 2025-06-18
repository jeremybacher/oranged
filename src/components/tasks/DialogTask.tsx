import React, { useEffect, useContext, useCallback, memo } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { TaskContext } from "../context/TasksContext";
import { v4 as uuidv4 } from "uuid";
import { SnackContext } from "../context/SnackContext";
import type { DialogTaskData } from "../types/DialogTaskData";

interface DialogTaskProps {
  dialogTaskData: DialogTaskData;
  setDialogTaskData: React.Dispatch<React.SetStateAction<DialogTaskData>>;
}

const DialogTask = memo(({
  dialogTaskData,
  setDialogTaskData,
}: DialogTaskProps) => {
  const { tasks, setTasks } = useContext(TaskContext);
  const { setMessage } = useContext(SnackContext);
  const [errorTitle, setErrorTitle] = React.useState("");
  const [errorDescription, setErrorDescription] = React.useState("");

  const editableTask = tasks.find(
    (task) => task.id === dialogTaskData.editableTaskId
  );

  const handleClose = useCallback(() => {
    setErrorTitle("");
    setErrorDescription("");
    setDialogTaskData({ openDialog: false });
  }, [setDialogTaskData]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (tasks.length >= 10 && !dialogTaskData.editableTaskId) {
      setMessage(
        "You have reached the limit of 10 tasks. Delete one to create a new one."
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    const title = formJson.title?.trim() || "";
    const description = formJson.description?.trim() || "";

    // Reset errors
    setErrorTitle("");
    setErrorDescription("");

    // Validation
    if (!title) {
      setErrorTitle("Title is required");
      return;
    } 
    
    if (title.length > 40) {
      setErrorTitle("Title must be less than 40 characters");
      return;
    }

    if (description && description.length > 200) {
      setErrorDescription("Description must be less than 200 characters");
      return;
    }

    try {
      let updatedTasks = [];
      
      if (dialogTaskData.editableTaskId) {
        // Edit existing task
        updatedTasks = tasks.map((task) => {
          if (task.id === dialogTaskData.editableTaskId) {
            return {
              ...task,
              title,
              description,
            };
          }
          return task;
        });
      } else {
        // Create new task
        updatedTasks = [
          ...tasks,
          {
            id: uuidv4(),
            title,
            description,
            completed: false,
          },
        ];
      }

      await setTasks(updatedTasks);
      handleClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      setMessage("Failed to save task. Please try again.");
    }
  }, [tasks, dialogTaskData, setTasks, setMessage, handleClose]);

  return (
    <Dialog
      open={dialogTaskData.openDialog}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: { bgcolor: theme => theme.palette.background.paper },
      }}
    >
      <DialogTitle>
        {dialogTaskData.editableTaskId ? "Edit" : "New"} Task
      </DialogTitle>
      <DialogContent>
        <TextField
          id="title"
          name="title"
          hiddenLabel
          size="medium"
          variant="outlined"
          placeholder="Enter the title of the task"
          fullWidth
          autoFocus
          InputProps={{
            autoComplete: "off",
          }}
          sx={{ mb: 2 }}
          defaultValue={editableTask?.title || ""}
          error={!!errorTitle}
          helperText={errorTitle || ""}
        />
        <TextField
          id="description"
          name="description"
          hiddenLabel
          size="medium"
          variant="outlined"
          placeholder="Enter the description of the task (optional)"
          fullWidth
          error={!!errorDescription}
          helperText={errorDescription || ""}
          InputProps={{
            rows: 3,
            multiline: true,
            inputComponent: "textarea",
            autoComplete: "off",
          }}
          defaultValue={editableTask?.description || ""}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" variant="contained">
          {dialogTaskData.editableTaskId ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

DialogTask.displayName = 'DialogTask';

export default DialogTask;
