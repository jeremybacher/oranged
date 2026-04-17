import React, { useContext, useCallback, memo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TaskContext } from "../context/TasksContext";
import { v4 as uuidv4 } from "uuid";
import { SnackContext } from "../context/SnackContext";
import type { DialogTaskData } from "../types/DialogTaskData";

interface DialogTaskProps {
  dialogTaskData: DialogTaskData;
  setDialogTaskData: React.Dispatch<React.SetStateAction<DialogTaskData>>;
}

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 300;

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

  const [titleValue, setTitleValue] = React.useState(editableTask?.title || "");
  const [descriptionValue, setDescriptionValue] = React.useState(editableTask?.description || "");

  React.useEffect(() => {
    if (dialogTaskData.openDialog) {
      setTitleValue(editableTask?.title || "");
      setDescriptionValue(editableTask?.description || "");
      setErrorTitle("");
      setErrorDescription("");
    }
  }, [dialogTaskData.openDialog, dialogTaskData.editableTaskId]);

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
    const formJson = Object.fromEntries(formData.entries()) as Record<string, string>;
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
    
    if (title.length > TITLE_MAX) {
      setErrorTitle(`Title must be less than ${TITLE_MAX} characters`);
      return;
    }

    if (description && description.length > DESCRIPTION_MAX) {
      setErrorDescription(`Description must be less than ${DESCRIPTION_MAX} characters`);
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

  const titleCountColor = titleValue.length >= 90 ? "error.main" : "text.disabled";
  const descCountColor = descriptionValue.length >= 290 ? "error.main" : "text.disabled";

  return (
    <Dialog
      open={dialogTaskData.openDialog}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="dialog-task-title"
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          borderRadius: 3,
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle
        id="dialog-task-title"
        sx={{ px: 3, pt: 3, pb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="h6" component="span" fontWeight={600}>
          {dialogTaskData.editableTaskId ? "Edit Task" : "New Task"}
        </Typography>
        <IconButton
          aria-label="Close dialog"
          onClick={handleClose}
          size="small"
          sx={{ color: "text.secondary", mr: -0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Box sx={{ mb: 2.5 }}>
          <InputLabel htmlFor="title" sx={{ mb: 0.75, fontSize: 13, fontWeight: 600, color: "text.primary" }}>
            Title <Box component="span" sx={{ color: "error.main" }}>*</Box>
          </InputLabel>
          <TextField
            id="title"
            name="title"
            size="medium"
            variant="outlined"
            placeholder="What needs to be done?"
            fullWidth
            autoFocus
            inputProps={{ autoComplete: "off", maxLength: TITLE_MAX, "aria-required": "true" }}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            error={!!errorTitle}
            helperText={
              errorTitle ? (
                <span>{errorTitle}</span>
              ) : (
                <Box component="span" sx={{ display: "block", textAlign: "right", fontVariantNumeric: "tabular-nums", color: titleCountColor }}>
                  {titleValue.length}/{TITLE_MAX}
                </Box>
              )
            }
          />
        </Box>

        <Box>
          <InputLabel htmlFor="description" sx={{ mb: 0.75, fontSize: 13, fontWeight: 600, color: "text.primary" }}>
            Description
            <Box component="span" sx={{ ml: 1, fontWeight: 400, color: "text.secondary", fontSize: 12 }}>
              optional
            </Box>
          </InputLabel>
          <TextField
            id="description"
            name="description"
            size="medium"
            variant="outlined"
            placeholder="Add details, links, or notes…"
            fullWidth
            multiline
            rows={4}
            inputProps={{ autoComplete: "off", maxLength: DESCRIPTION_MAX }}
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            error={!!errorDescription}
            helperText={
              errorDescription ? (
                <span>{errorDescription}</span>
              ) : (
                <Box component="span" sx={{ display: "block", textAlign: "right", fontVariantNumeric: "tabular-nums", color: descCountColor }}>
                  {descriptionValue.length}/{DESCRIPTION_MAX}
                </Box>
              )
            }
          />
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" size="medium">
          Cancel
        </Button>
        <Button type="submit" variant="contained" size="medium">
          {dialogTaskData.editableTaskId ? "Save changes" : "Create task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

DialogTask.displayName = 'DialogTask';

export default DialogTask;
