import React, { memo, useContext, useState, useCallback, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { Plus, Trash2, ArrowUpDown, Circle, CheckCircle2 } from "lucide-react";
import { HTML5Backend } from "react-dnd-html5-backend";
import TaskList from "./TaskList";
import { TaskContext } from "../context/TasksContext";
import DialogTask from "./DialogTask";
import LoadingSpinner from "../LoadingSpinner";
import type { DialogTaskData } from "../types/DialogTaskData";
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

const Tasks = memo(() => {
  const { tasks, setTasks, loading, error } = useContext(TaskContext);
  const [dialogTaskData, setDialogTaskData] = useState<DialogTaskData>({
    openDialog: false,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"none" | "uncompleted-first" | "completed-first">("none");

  const sortedTasks = useMemo(() => {
    if (sortOrder === "none") return tasks;
    return [...tasks].sort((a, b) => {
      if (sortOrder === "completed-first") return Number(b.completed) - Number(a.completed);
      return Number(a.completed) - Number(b.completed);
    });
  }, [tasks, sortOrder]);

  const cycleSortOrder = useCallback(() => {
    setSortOrder((prev) =>
      prev === "none" ? "uncompleted-first" : prev === "uncompleted-first" ? "completed-first" : "none"
    );
  }, []);

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
      <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-destructive">
        <p className="text-base font-semibold mb-2">Error loading tasks</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-background mb-2 flex flex-col overflow-y-auto h-[70vh] max-w-full relative rounded-sm">
        {tasks.length > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border min-h-[44px]">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={handleToggleSelectAll}
                aria-label={allSelected ? "Deselect all tasks" : "Select all tasks"}
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select tasks"}
              </span>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        )}

        {tasks.length > 0 ? (
          <>
            <div className="flex items-center justify-end px-3 py-1 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleSortOrder}
                className="h-7 text-xs text-muted-foreground gap-1.5"
                aria-label="Cycle sort order"
              >
                {sortOrder === "none" && <><ArrowUpDown className="h-3.5 w-3.5" /> Manual order</>}
                {sortOrder === "uncompleted-first" && <><Circle className="h-3.5 w-3.5" /> Active first</>}
                {sortOrder === "completed-first" && <><CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> Done first</>}
              </Button>
            </div>
            <DndProvider backend={HTML5Backend}>
              <TaskList
                tasks={sortedTasks}
                setDialogTaskData={setDialogTaskData}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                disableDrag={sortOrder !== "none"}
              />
            </DndProvider>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <p className="text-base font-semibold text-muted-foreground mb-2">
              No tasks yet
            </p>
            <p className="text-sm text-muted-foreground">
              Click the + button below to add your first task
            </p>
          </div>
        )}
      </div>

      <Button
        aria-label="Add new task"
        onClick={handleAddTask}
        size="icon"
        className="fixed bottom-4 right-4 z-[1000] h-12 w-12 rounded-full shadow-lg"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </Button>

      {dialogTaskData.openDialog && (
        <DialogTask
          dialogTaskData={dialogTaskData}
          setDialogTaskData={setDialogTaskData}
        />
      )}

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedIds.size} {selectedIds.size === 1 ? "task" : "tasks"}?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              {selectedIds.size === 1
                ? "the selected task"
                : `all ${selectedIds.size} selected tasks`}
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

Tasks.displayName = "Tasks";

export default Tasks;
