import React, { memo, useCallback, useContext } from "react";
import {
  Box,
  Checkbox,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { DragIndicator } from "@mui/icons-material";
import { TaskContext } from "../context/TasksContext";
import type { Task } from "../types/Task";

interface DraggableItemProps extends Task {
  index: number;
  onEditTask: (id: string) => void;
}

const DraggableItem = memo(({
  id,
  title,
  description,
  completed,
  index,
  onEditTask,
}: DraggableItemProps) => {
  const { tasks, setTasks } = useContext(TaskContext);

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

  const completedTask = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === event.target.name) {
        return { ...task, completed: event.target.checked };
      }
      return task;
    });

    try {
      await setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to update task completion:', error);
    }
  }, [tasks, setTasks]);

  const removeTask = useCallback(async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      try {
        await setTasks(updatedTasks);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  }, [tasks, setTasks]);

  const handleEditTask = useCallback(() => {
    onEditTask(id);
  }, [id, onEditTask]);

  const handleRemoveTask = useCallback(() => {
    removeTask(id);
  }, [id, removeTask]);

  return (
    <ListItem
      ref={(node) => ref(drop(node))}
      divider
      secondaryAction={
        <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
          <IconButton 
            edge="end" 
            aria-label={`Edit task: ${title}`} 
            sx={{ mr: 1 }} 
            onClick={handleEditTask}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            edge="end"
            aria-label={`Delete task: ${title}`}
            onClick={handleRemoveTask}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      }
      sx={{ mt: 1 }}
    >
      <ListItemIcon sx={{ cursor: "move" }}>
        <DragIndicator />
      </ListItemIcon>
      <ListItemAvatar>
        <Checkbox
          name={id}
          checked={completed}
          color="success"
          onChange={completedTask}
          aria-label={`Mark task "${title}" as ${completed ? 'incomplete' : 'complete'}`}
        />
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={description}
        sx={{
          textDecoration: completed ? "line-through" : "none",
          opacity: completed ? 0.7 : 1,
        }}
      />
    </ListItem>
  );
});

DraggableItem.displayName = 'DraggableItem';

export default DraggableItem;
