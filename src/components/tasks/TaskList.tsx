import React, { Fragment, memo } from "react";
import { List } from "@mui/material";
import { TaskContext } from "../context/TasksContext";
import DraggableItem from "./DraggableItem";
import type { Task } from "../types/Task";
import type { DialogTaskData } from "../types/DialogTaskData";

interface TaskListProps {
  setDialogTaskData: React.Dispatch<React.SetStateAction<DialogTaskData>>;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

const TaskList = memo(({ setDialogTaskData, selectedIds, onToggleSelect }: TaskListProps) => {
  const { tasks } = React.useContext(TaskContext);

  const onEditTaskHandler = (id: string) => {
    setDialogTaskData({ openDialog: true, editableTaskId: id });
  };

  return (
    <Fragment>
      <List>
        {tasks.map((task: Task, index: number) => (
          <DraggableItem
            key={task.id}
            {...task}
            index={index}
            onEditTask={onEditTaskHandler}
            selected={selectedIds.has(task.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </List>
    </Fragment>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;
