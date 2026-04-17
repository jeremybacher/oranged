import React, { useContext, useCallback, memo } from "react";
import { TaskContext } from "../context/TasksContext";
import { v4 as uuidv4 } from "uuid";
import { SnackContext } from "../context/SnackContext";
import type { DialogTaskData } from "../types/DialogTaskData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface DialogTaskProps {
  dialogTaskData: DialogTaskData;
  setDialogTaskData: React.Dispatch<React.SetStateAction<DialogTaskData>>;
}

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 300;

const DialogTask = memo(({ dialogTaskData, setDialogTaskData }: DialogTaskProps) => {
  const { tasks, setTasks } = useContext(TaskContext);
  const { setMessage } = useContext(SnackContext);
  const [errorTitle, setErrorTitle] = React.useState("");
  const [errorDescription, setErrorDescription] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);

  const editableTask = tasks.find((task) => task.id === dialogTaskData.editableTaskId);

  const [titleValue, setTitleValue] = React.useState(editableTask?.title || "");
  const [descriptionValue, setDescriptionValue] = React.useState(
    editableTask?.description || ""
  );

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

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (tasks.length >= 10 && !dialogTaskData.editableTaskId) {
        setMessage("You have reached the limit of 10 tasks. Delete one to create a new one.");
        return;
      }

      const formData = new FormData(event.currentTarget);
      const formJson = Object.fromEntries(formData.entries()) as Record<string, string>;
      const title = formJson.title?.trim() || "";
      const description = formJson.description?.trim() || "";

      setErrorTitle("");
      setErrorDescription("");

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
          updatedTasks = tasks.map((task) =>
            task.id === dialogTaskData.editableTaskId
              ? { ...task, title, description }
              : task
          );
        } else {
          updatedTasks = [
            ...tasks,
            { id: uuidv4(), title, description, completed: false },
          ];
        }

        await setTasks(updatedTasks);
        handleClose();
      } catch (error) {
        console.error("Failed to save task:", error);
        setMessage("Failed to save task. Please try again.");
      }
    },
    [tasks, dialogTaskData, setTasks, setMessage, handleClose]
  );

  const titleCountColor =
    titleValue.length >= 90 ? "text-destructive" : "text-muted-foreground";
  const descCountColor =
    descriptionValue.length >= 290 ? "text-destructive" : "text-muted-foreground";

  return (
    <Dialog
      open={dialogTaskData.openDialog}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="sm:max-w-md" aria-describedby="dialog-task-desc">
        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>
              {dialogTaskData.editableTaskId ? "Edit Task" : "New Task"}
            </DialogTitle>
            <DialogDescription id="dialog-task-desc" className="sr-only">
              {dialogTaskData.editableTaskId
                ? "Edit the details of your task."
                : "Fill in the details to create a new task."}
            </DialogDescription>
          </DialogHeader>

          <div className="border-t border-border" />

          <div className="px-6 py-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-[13px]">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="What needs to be done?"
                autoFocus
                autoComplete="off"
                maxLength={TITLE_MAX}
                aria-required="true"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                className={errorTitle ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <div className="flex justify-between items-center min-h-[18px]">
                {errorTitle ? (
                  <p className="text-xs text-destructive">{errorTitle}</p>
                ) : (
                  <span />
                )}
                <span
                  className={`text-xs tabular-nums ml-auto ${titleCountColor}`}
                >
                  {titleValue.length}/{TITLE_MAX}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[13px]">
                Description{" "}
                <span className="text-muted-foreground font-normal text-xs">optional</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add details, links, or notes…"
                autoComplete="off"
                maxLength={DESCRIPTION_MAX}
                rows={4}
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
                className={
                  errorDescription ? "border-destructive focus-visible:ring-destructive" : ""
                }
              />
              <div className="flex justify-between items-center min-h-[18px]">
                {errorDescription ? (
                  <p className="text-xs text-destructive">{errorDescription}</p>
                ) : (
                  <span className="text-xs text-muted-foreground/60">Enter to save · Shift+Enter for new line</span>
                )}
                <span
                  className={`text-xs tabular-nums ml-auto ${descCountColor}`}
                >
                  {descriptionValue.length}/{DESCRIPTION_MAX}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {dialogTaskData.editableTaskId ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

DialogTask.displayName = "DialogTask";

export default DialogTask;
