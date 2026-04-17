import React, { memo, useCallback, useContext, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { CheckCircle, CheckCircleOutline, DragIndicator } from "@mui/icons-material";
import { TaskContext } from "../context/TasksContext";
import { renderWithLinks } from "../utils/renderWithLinks";
import type { Task } from "../types/Task";

interface DraggableItemProps extends Task {
  index: number;
  onEditTask: (id: string) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
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
}: DraggableItemProps) => {
  const { tasks, setTasks } = useContext(TaskContext);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [, ref] = useDrag({
    type: "ITEM",
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem: { id: string; index: number }) => {
      if (draggedItem.index !== index) {
        moveTask(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const moveTask = useCallback(async (fromIndex: number, toIndex: number) => {
    const updatedTasks = [...tasks];
    const [movedItem] = updatedTasks.splice(fromIndex, 1);
    updatedTasks.splice(toIndex, 0, movedItem);
    
    try {
      await setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to save task order:', error);
    }
  }, [tasks, setTasks]);

  const toggleCompleted = useCallback(async () => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    try {
      await setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to update task completion:', error);
    }
  }, [id, tasks, setTasks]);

  const handleConfirmDelete = useCallback(async () => {
    setConfirmOpen(false);
    const updatedTasks = tasks.filter((task) => task.id !== id);
    try {
      await setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, [id, tasks, setTasks]);

  const handleEditTask = useCallback(() => {
    onEditTask(id);
  }, [id, onEditTask]);

  return (
    <React.Fragment>
    <ListItem
      ref={(node) => ref(drop(node))}
      divider
      secondaryAction={
        <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            size="small"
            aria-label={`Mark task "${title}" as ${completed ? "incomplete" : "complete"}`}
            onClick={toggleCompleted}
            sx={{ color: completed ? "success.main" : "action.disabled" }}
          >
            {completed ? <CheckCircle fontSize="small" aria-hidden="true" /> : <CheckCircleOutline fontSize="small" aria-hidden="true" />}
          </IconButton>
          <IconButton size="small" aria-label={`Edit task: ${title}`} onClick={handleEditTask}>
            <EditIcon fontSize="small" aria-hidden="true" />
          </IconButton>
          <IconButton size="small" edge="end" aria-label={`Delete task: ${title}`} onClick={() => setConfirmOpen(true)}>
            <DeleteIcon fontSize="small" aria-hidden="true" />
          </IconButton>
        </Box>
      }
      sx={{ mt: 1 }}
    >
      <Checkbox
        edge="start"
        checked={selected}
        onChange={() => onToggleSelect(id)}
        size="small"
        sx={{ mr: -1 }}
        aria-label={`Select task "${title}"`}
      />
      <ListItemIcon sx={{ cursor: "move", minWidth: 32 }}>
        <DragIndicator fontSize="small" aria-hidden="true" />
      </ListItemIcon>
<ListItemText
        primary={title}
        secondary={description ? renderWithLinks(description) : undefined}
        sx={{
          textDecoration: completed ? "line-through" : "none",
          opacity: completed ? 0.7 : 1,
        }}
      />
    </ListItem>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete task?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &#8220;{title}&#8221; will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
});

DraggableItem.displayName = 'DraggableItem';

export default DraggableItem;
