import React, { Fragment, memo } from "react";
import { List } from "@mui/material";
import { TaskContext } from "../context/TasksContext";
import DraggableItem from "./DraggableItem";
import type { Task } from "../types/Task";
import type { DialogTaskData } from "../types/DialogTaskData";

interface TaskListProps {
  setDialogTaskData: React.Dispatch<React.SetStateAction<DialogTaskData>>;
}

const TaskList = memo(({ setDialogTaskData }: TaskListProps) => {
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
          />
        ))}
      </List>
    </Fragment>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;
