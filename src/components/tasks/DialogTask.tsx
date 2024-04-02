import React, { useEffect } from "react";
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

interface DialogTaskProps {
  dialogTaskData: DialogTaskData;
  setDialogTaskData: React.Dispatch<React.SetStateAction<DialogTaskData>>;
}

const DialogTask = ({
  dialogTaskData,
  setDialogTaskData,
}: DialogTaskProps) => {
  const { tasks, setTasks } = React.useContext(TaskContext);
  const { setMessage } = React.useContext(SnackContext);
  const [errorTitle, setErrorTitle] = React.useState("");
  const [errorDesription, setErrorDescription] = React.useState("");

  const editableTask = tasks.find(
    (task) => task.id === dialogTaskData.editableTaskId
  );

  useEffect(() => {
    if (dialogTaskData.editableTaskId) {
      setDialogTaskData({ ...dialogTaskData, openDialog: true });
    }
  }, [dialogTaskData.editableTaskId, setDialogTaskData]);

  const handleClose = () => {
    setErrorTitle("");
    setDialogTaskData({ openDialog: false, editableTaskId: "" });
  };

  return (
    <Dialog
      open={dialogTaskData.openDialog}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: "form",
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();

          if (tasks.length >= 10) {
            setMessage(
              "You have reached the limit of tasks listed. Delete one to create a new one."
            );
            return;
          }

          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const title = formJson.title.trim();
          const description = formJson.description.trim();

          if (!title) {
            setErrorTitle("Title is required");
            return;
          } else if (title.length > 40) {
            setErrorTitle("Title must be less than 40 characters");
            return;
          }

          if (description && description.length > 200) {
            setErrorDescription("Description must be less than 100 characters");
            return;
          }

          let updatedTasks = [];
          if (dialogTaskData.editableTaskId) {
            updatedTasks = tasks.map((task) => {
              if (task.id === dialogTaskData.editableTaskId) {
                return {
                  ...task,
                  title: title,
                  description: description,
                };
              }
              return task;
            });
          } else {
            updatedTasks = [
              ...tasks,
              {
                id: uuidv4(),
                title: title,
                description: description,
                completed: false,
              },
            ];
          }

          chrome.storage.sync.set({ tasks: JSON.stringify(updatedTasks) });
          setTasks(updatedTasks);

          handleClose();
        },
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
          InputProps={{
            autoComplete: "off",
          }}
          sx={{ mb: 2 }}
          defaultValue={editableTask ? editableTask.title : ""}
          error={errorTitle ? true : false}
          helperText={errorTitle || ""}
        />
        <TextField
          id="description"
          name="description"
          hiddenLabel
          size="medium"
          variant="outlined"
          placeholder="Enter the description of the task"
          fullWidth
          error={errorDesription ? true : false}
          helperText={errorDesription || ""}
          InputProps={{
            rows: 3,
            multiline: true,
            inputComponent: "textarea",
            autoComplete: "off",
          }}
          defaultValue={
            editableTask && editableTask.description
              ? editableTask.description
              : ""
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="button" variant="contained">
          {dialogTaskData.editableTaskId ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogTask;
