import React, { memo, useCallback, useContext, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Trash2, Pencil, CheckCircle2, Circle, GripVertical, Copy } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { TaskContext } from "../context/TasksContext";
import { renderWithLinks } from "../utils/renderWithLinks";
import type { Task } from "../types/Task";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface DraggableItemProps extends Task {
  index: number;
  onEditTask: (id: string) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  disableDrag?: boolean;
}

const DraggableItem = memo(({
  id,
  title,
  description,
  completed,
  index,
  onEditTask,
  selected,
  onToggleSelect,
  disableDrag,
}: DraggableItemProps) => {
  const { tasks, setTasks } = useContext(TaskContext);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [, ref] = useDrag({
    type: "ITEM",
    item: { id, index },
    canDrag: !disableDrag,
  });

  const [, drop] = useDrop({
    accept: "ITEM",
    canDrop: () => !disableDrag,
    hover: (draggedItem: { id: string; index: number }) => {
      if (!disableDrag && draggedItem.index !== index) {
        moveTask(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const moveTask = useCallback(
    async (fromIndex: number, toIndex: number) => {
      const updatedTasks = [...tasks];
      const [movedItem] = updatedTasks.splice(fromIndex, 1);
      updatedTasks.splice(toIndex, 0, movedItem);
      try {
        await setTasks(updatedTasks);
      } catch (error) {
        console.error("Failed to save task order:", error);
      }
    },
    [tasks, setTasks]
  );

  const toggleCompleted = useCallback(async () => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    try {
      await setTasks(updatedTasks);
    } catch (error) {
      console.error("Failed to update task completion:", error);
    }
  }, [id, tasks, setTasks]);

  const handleConfirmDelete = useCallback(async () => {
    setConfirmOpen(false);
    const updatedTasks = tasks.filter((task) => task.id !== id);
    try {
      await setTasks(updatedTasks);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }, [id, tasks, setTasks]);

  const handleDuplicate = useCallback(async () => {
    const idx = tasks.findIndex((t) => t.id === id);
    const duplicate = { id: uuidv4(), title, description, completed: false };
    const updated = [...tasks];
    updated.splice(idx + 1, 0, duplicate);
    try {
      await setTasks(updated);
    } catch (error) {
      console.error("Failed to duplicate task:", error);
    }
  }, [id, title, description, tasks, setTasks]);

  const handleEditTask = useCallback(() => {
    onEditTask(id);
  }, [id, onEditTask]);

  return (
    <>
      <li
        ref={(node) => { ref(drop(node)); }}
        className="flex items-start gap-2 px-2 py-2 border-b border-border last:border-b-0 mt-1"
      >
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(id)}
          aria-label={`Select task "${title}"`}
          className="mt-0.5 shrink-0"
        />

        {!disableDrag && (
          <GripVertical
            className="h-4 w-4 text-muted-foreground cursor-move mt-0.5 shrink-0"
            aria-hidden="true"
          />
        )}

        <div className={`flex-1 min-w-0 ${completed ? "opacity-60" : ""}`}>
          <p
            className={`text-[15px] leading-snug ${
              completed ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {title}
          </p>
          {description && (
            <p className="text-[13px] text-muted-foreground mt-0.5 break-words">
              {renderWithLinks(description)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0 ml-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Mark task "${title}" as ${completed ? "incomplete" : "complete"}`}
            onClick={toggleCompleted}
            className={`h-7 w-7 ${completed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
          >
            {completed ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Duplicate task: ${title}`}
            onClick={handleDuplicate}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit task: ${title}`}
            onClick={handleEditTask}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete task: ${title}`}
            onClick={() => setConfirmOpen(true)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </li>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
            <DialogDescription>
              &#8220;{title}&#8221; will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

DraggableItem.displayName = "DraggableItem";

export default DraggableItem;
