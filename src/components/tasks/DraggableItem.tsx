import React from "react";
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

interface DraggableItemProps extends Task {
  index: number;
  onEditTask: (id: string) => void;
}

const DraggableItem = ({
  id,
  title,
  description,
  completed,
  index,
  onEditTask,
}: DraggableItemProps) => {
  const { tasks, setTasks } = React.useContext(TaskContext);

  const [, ref] = useDrag({
    type: "ITEM",
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: "ITEM",
    hover: (draggedItem: any) => {
      if (draggedItem.index !== index) {
        moveTask(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const moveTask = (fromIndex: number, toIndex: number) => {
    const updatedTasks = [...tasks];
    const [movedItem] = updatedTasks.splice(fromIndex, 1);
    updatedTasks.splice(toIndex, 0, movedItem);
    chrome.storage.sync.set({ tasks: JSON.stringify(updatedTasks) });
    setTasks(updatedTasks);
  };

  const completedTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === event.target.name) {
        return { ...task, completed: event.target.checked };
      }
      return task;
    });

    chrome.storage.sync.set({ tasks: JSON.stringify(updatedTasks) });
    setTasks(updatedTasks);
  };

  const removeTask = (id: string) => {
    if (confirm("Are you sure to delete this task?")) {
      const updatedTasks = tasks.filter((task) => task.id !== id);
      chrome.storage.sync.set({ tasks: JSON.stringify(updatedTasks) });
      setTasks(updatedTasks);
    }
  };

  return (
    <ListItem
      ref={(node) => ref(drop(node))}
      key={id}
      divider
      secondaryAction={
        <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
          <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }} onClick={() => onEditTask(id)}>
            <EditIcon />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => removeTask(id)}
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
          name={`${id}`}
          checked={completed}
          color="success"
          onChange={completedTask}
        />
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={description}
        sx={{
          textDecoration: completed ? "line-through" : "none",
        }}
      />
    </ListItem>
  );
};

export default DraggableItem;
